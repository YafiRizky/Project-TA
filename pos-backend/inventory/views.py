from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.utils import timezone
from django.db.models import Sum, Q
from .models import ProductBatch, InventoryMovement
from .serializers import ProductBatchSerializer, InventoryMovementSerializer
from accounts.permissions import IsBusinessAdmin
from auditlog.utils import log_action


class ProductBatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProductBatch (Stock) CRUD and inventory management
    Automatically filters by user's business
    Includes FIFO tracking and expiry monitoring
    
    Actions:
    - list: GET /api/inventory/batches/
    - create: POST /api/inventory/batches/
    - retrieve: GET /api/inventory/batches/{id}/
    - update: PUT /api/inventory/batches/{id}/
    - partial_update: PATCH /api/inventory/batches/{id}/
    - destroy: DELETE /api/inventory/batches/{id}/
    - summary: GET /api/inventory/batches/summary/ (custom action)
    - expiring_soon: GET /api/inventory/batches/expiring_soon/ (custom action)
    """
    serializer_class = ProductBatchSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['batch_code', 'product__name', 'product__code']
    ordering_fields = ['purchase_date', 'expiry_date', 'quantity', 'status']
    ordering = ['purchase_date']  # FIFO: oldest first
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsBusinessAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Filter product batches by authenticated user's business.
        Auto-expire: batch ACTIVE yang expiry_date-nya sudah lewat hari ini
        akan langsung diubah statusnya ke EXPIRED di database (single source of truth).
        """
        if hasattr(self.request.user, 'business'):
            queryset = ProductBatch.objects.filter(
                business=self.request.user.business
            ).select_related('product', 'business')

            # Auto-expire: update batch yang sudah lewat tanggal ke status EXPIRED
            today = timezone.localdate()
            expired_ids = queryset.filter(
                status='ACTIVE',
                expiry_date__isnull=False,
                expiry_date__lt=today
            ).values_list('id', flat=True)
            if expired_ids:
                ProductBatch.objects.filter(id__in=list(expired_ids)).update(status='EXPIRED')

            # Filter by status if provided
            status_filter = self.request.query_params.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)

            # Filter by product if provided
            product_id = self.request.query_params.get('product_id')
            if product_id:
                queryset = queryset.filter(product_id=product_id)

            return queryset
        return ProductBatch.objects.none()

    def perform_create(self, serializer):
        """Auto-assign business and create initial inventory movement"""
        batch = serializer.save(business=self.request.user.business)

        # Create inventory movement log
        InventoryMovement.objects.create(
            business=self.request.user.business,
            batch=batch,
            movement_type='IN',
            quantity=batch.quantity,
            notes=f"Initial stock in - Batch {batch.batch_code}",
            reference_id=f"BATCH-{batch.id}"
        )
        log_action(self.request, 'CREATE', 'Batch',
                   f'Menambah batch "{batch.batch_code}" untuk produk "{batch.product.name}" (qty: {batch.quantity})',
                   target_id=batch.id,
                   new_data={'batch_code': batch.batch_code, 'product': batch.product.name,
                             'quantity': batch.quantity, 'purchase_cost': str(batch.purchase_cost)})

    def perform_update(self, serializer):
        old = self.get_object()
        old_data = {'quantity': old.quantity, 'purchase_cost': str(old.purchase_cost),
                    'expiry_date': str(old.expiry_date) if old.expiry_date else None}
        batch = serializer.save()
        new_data = {'quantity': batch.quantity, 'purchase_cost': str(batch.purchase_cost),
                    'expiry_date': str(batch.expiry_date) if batch.expiry_date else None}
        log_action(self.request, 'UPDATE', 'Batch',
                   f'Mengubah batch "{batch.batch_code}" produk "{batch.product.name}"',
                   target_id=batch.id, old_data=old_data, new_data=new_data)

    def perform_destroy(self, instance):
        log_action(self.request, 'DELETE', 'Batch',
                   f'Menghapus batch "{instance.batch_code}" produk "{instance.product.name}" (sisa qty: {instance.quantity})',
                   target_id=instance.id,
                   old_data={'batch_code': instance.batch_code, 'product': instance.product.name, 'quantity': instance.quantity})
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get inventory summary for dashboard"""
        if not hasattr(request.user, 'business'):
            return Response({'error': 'No business associated'}, status=status.HTTP_400_BAD_REQUEST)
        
        business = request.user.business
        batches = self.get_queryset()
        
        total_quantity = batches.aggregate(Sum('quantity'))['quantity__sum'] or 0
        total_value = sum(
            (b.quantity * b.purchase_cost) for b in batches
        )
        active_count = batches.filter(status='ACTIVE').count()
        expired_count = batches.filter(status='EXPIRED').count()
        
        return Response({
            'total_products': batches.values('product').distinct().count(),
            'total_batches': batches.count(),
            'total_quantity': total_quantity,
            'total_value': str(total_value),
            'active_batches': active_count,
            'expired_batches': expired_count,
        })
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get batches expiring within days (default 7 days)"""
        if not hasattr(request.user, 'business'):
            return Response({'error': 'No business associated'}, status=status.HTTP_400_BAD_REQUEST)
        
        days = int(request.query_params.get('days', 7))
        today = timezone.localdate()
        from datetime import timedelta
        expiry_cutoff = today + timedelta(days=days)
        
        batches = self.get_queryset().filter(
            expiry_date__isnull=False,
            expiry_date__gte=today,
            expiry_date__lte=expiry_cutoff,
            status='ACTIVE'
        )
        
        serializer = self.get_serializer(batches, many=True)
        return Response(serializer.data)


class InventoryMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for InventoryMovement (read-only audit trail)
    Shows all inventory transactions for auditing
    
    Actions:
    - list: GET /api/inventory/movements/
    - retrieve: GET /api/inventory/movements/{id}/
    """
    serializer_class = InventoryMovementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['batch__batch_code', 'batch__product__name', 'reference_id']
    ordering_fields = ['created_at', 'movement_type']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filter movements by authenticated user's business
        """
        if hasattr(self.request.user, 'business'):
            queryset = InventoryMovement.objects.filter(
                business=self.request.user.business
            ).select_related('batch', 'batch__product')
            
            # Filter by movement type if provided
            movement_type = self.request.query_params.get('movement_type')
            if movement_type:
                queryset = queryset.filter(movement_type=movement_type)
            
            return queryset
        return InventoryMovement.objects.none()

from .models import StockOpname
from .serializers import StockOpnameSerializer
from django.db import transaction

class StockOpnameViewSet(viewsets.ModelViewSet):
    serializer_class = StockOpnameSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['document_number', 'created_by']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if hasattr(self.request.user, 'business'):
            return StockOpname.objects.filter(business=self.request.user.business).prefetch_related('items', 'items__batch', 'items__batch__product')
        return StockOpname.objects.none()
        
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsBusinessAdmin])
    def approve(self, request, pk=None):
        opname = self.get_object()
        if opname.status != 'PENDING':
            return Response({'error': 'Stock Opname is not PENDING'}, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            for item in opname.items.select_related('batch', 'batch__product').all():
                diff = item.difference
                batch = item.batch
                business = opname.business
                
                if diff == 0:
                    continue  # No adjustment needed
                
                if diff < 0:
                    # Shortage: reduce batch quantity
                    deduct = min(batch.quantity, abs(diff))
                    batch.quantity -= deduct
                    if batch.quantity == 0:
                        batch.status = 'DEPLETED'
                    batch.save()
                    
                    InventoryMovement.objects.create(
                        business=business,
                        batch=batch,
                        movement_type='ADJ',
                        quantity=-deduct,
                        notes=f"Stock Opname Shortage {opname.document_number} ({batch.product.name} - {batch.batch_code})",
                        reference_id=opname.document_number
                    )
                    
                elif diff > 0:
                    # Excess: add to the same batch
                    batch.quantity += diff
                    if batch.status == 'DEPLETED':
                        batch.status = 'ACTIVE'
                    batch.save()
                    
                    InventoryMovement.objects.create(
                        business=business,
                        batch=batch,
                        movement_type='ADJ',
                        quantity=diff,
                        notes=f"Stock Opname Excess {opname.document_number} ({batch.product.name} - {batch.batch_code})",
                        reference_id=opname.document_number
                    )
            
            opname.status = 'APPROVED'
            opname.approved_by = request.user.username
            opname.save()
            
            log_action(request, 'UPDATE', 'Stock Opname', f'Menyetujui Stock Opname {opname.document_number}', target_id=opname.id)
            
        return Response({'status': 'Approved and stock adjusted'})
        
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsBusinessAdmin])
    def reject(self, request, pk=None):
        opname = self.get_object()
        if opname.status != 'PENDING':
            return Response({'error': 'Stock Opname is not PENDING'}, status=status.HTTP_400_BAD_REQUEST)
            
        opname.status = 'REJECTED'
        opname.approved_by = request.user.username
        opname.save()
        
        log_action(request, 'UPDATE', 'Stock Opname', f'Menolak Stock Opname {opname.document_number}', target_id=opname.id)
        
        return Response({'status': 'Rejected'})

