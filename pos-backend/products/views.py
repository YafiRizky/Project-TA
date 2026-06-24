from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Category, Supplier, Product
from .serializers import CategorySerializer, SupplierSerializer, ProductSerializer, generate_code
from accounts.permissions import IsBusinessAdmin
from auditlog.utils import log_action


class SupplierViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Supplier CRUD operations
    Automatically filters by user's business
    
    Actions:
    - list: GET /api/products/suppliers/
    - create: POST /api/products/suppliers/
    - retrieve: GET /api/products/suppliers/{id}/
    - update: PUT /api/products/suppliers/{id}/
    - partial_update: PATCH /api/products/suppliers/{id}/
    - destroy: DELETE /api/products/suppliers/{id}/
    """
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'contact_person', 'email']
    ordering_fields = ['name', 'code', 'city', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsBusinessAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Filter suppliers by authenticated user's business
        """
        if hasattr(self.request.user, 'business'):
            queryset = Supplier.objects.filter(business=self.request.user.business)
            
            # Filter by is_active if provided
            is_active = self.request.query_params.get('is_active')
            if is_active is not None:
                queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
            return queryset
        return Supplier.objects.none()
    
    def perform_create(self, serializer):
        if hasattr(self.request.user, 'business'):
            instance = serializer.save(business=self.request.user.business)
            log_action(self.request, 'CREATE', 'Supplier', f'Menambah supplier "{instance.name}"',
                       target_id=instance.id, new_data={'name': instance.name, 'code': instance.code})
        else:
            raise ValueError("User must be associated with a business")
    
    def perform_update(self, serializer):
        old = self.get_object()
        old_data = {'name': old.name, 'contact_person': old.contact_person, 'phone': old.phone}
        if hasattr(self.request.user, 'business'):
            instance = serializer.save(business=self.request.user.business)
            new_data = {'name': instance.name, 'contact_person': instance.contact_person, 'phone': instance.phone}
            log_action(self.request, 'UPDATE', 'Supplier', f'Mengubah supplier "{instance.name}"',
                       target_id=instance.id, old_data=old_data, new_data=new_data)
        else:
            raise ValueError("User must be associated with a business")

    def perform_destroy(self, instance):
        log_action(self.request, 'DELETE', 'Supplier', f'Menghapus supplier "{instance.name}"',
                   target_id=instance.id, old_data={'name': instance.name, 'code': instance.code})
        instance.delete()


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product CRUD operations
    Automatically filters by user's business
    
    Actions:
    - list: GET /api/products/products/
    - create: POST /api/products/products/
    - retrieve: GET /api/products/products/{id}/
    - update: PUT /api/products/products/{id}/
    - partial_update: PATCH /api/products/products/{id}/
    - destroy: DELETE /api/products/products/{id}/
    """
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['name', 'code', 'selling_price', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsBusinessAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Filter products by authenticated user's business
        """
        if hasattr(self.request.user, 'business'):
            queryset = Product.objects.filter(business=self.request.user.business).select_related('category', 'supplier')
            
            # Filter by is_active if provided
            is_active = self.request.query_params.get('is_active')
            if is_active is not None:
                queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
            # Filter by category if provided
            category_id = self.request.query_params.get('category_id')
            if category_id:
                queryset = queryset.filter(category_id=category_id)
            
            return queryset
        return Product.objects.none()
    
    def perform_create(self, serializer):
        if hasattr(self.request.user, 'business'):
            instance = serializer.save(business=self.request.user.business)
            log_action(self.request, 'CREATE', 'Produk', f'Menambah produk "{instance.name}" (harga jual: Rp {instance.selling_price:,.0f})',
                       target_id=instance.id, new_data={'name': instance.name, 'code': instance.code, 'selling_price': str(instance.selling_price)})
        else:
            raise ValueError("User must be associated with a business")
    
    def perform_update(self, serializer):
        old = self.get_object()
        old_data = {'name': old.name, 'selling_price': str(old.selling_price), 'purchase_price': str(old.purchase_price),
                    'min_stock': old.min_stock, 'is_active': old.is_active}
        if hasattr(self.request.user, 'business'):
            instance = serializer.save(business=self.request.user.business)
            new_data = {'name': instance.name, 'selling_price': str(instance.selling_price), 'purchase_price': str(instance.purchase_price),
                        'min_stock': instance.min_stock, 'is_active': instance.is_active}
            changes = [k for k in old_data if old_data[k] != new_data.get(k)]
            desc = f'Mengubah produk "{instance.name}"'
            if 'selling_price' in changes:
                desc += f' (harga: Rp {old.selling_price:,.0f} → Rp {instance.selling_price:,.0f})'
            log_action(self.request, 'UPDATE', 'Produk', desc,
                       target_id=instance.id, old_data=old_data, new_data=new_data)
        else:
            raise ValueError("User must be associated with a business")

    def perform_destroy(self, instance):
        log_action(self.request, 'DELETE', 'Produk', f'Menghapus produk "{instance.name}"',
                   target_id=instance.id, old_data={'name': instance.name, 'code': instance.code, 'selling_price': str(instance.selling_price)})
        instance.delete()


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category CRUD operations
    Automatically filters by user's business
    
    Actions:
    - list: GET /api/products/categories/
    - create: POST /api/products/categories/
    - retrieve: GET /api/products/categories/{id}/
    - update: PUT /api/products/categories/{id}/
    - partial_update: PATCH /api/products/categories/{id}/
    - destroy: DELETE /api/products/categories/{id}/
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsBusinessAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Filter categories by authenticated user's business
        """
        if hasattr(self.request.user, 'business'):
            queryset = Category.objects.filter(business=self.request.user.business)
            
            # Filter by is_active if provided
            is_active = self.request.query_params.get('is_active')
            if is_active is not None:
                queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
            return queryset
        return Category.objects.none()
    
    def perform_create(self, serializer):
        if hasattr(self.request.user, 'business'):
            instance = serializer.save(business=self.request.user.business)
            log_action(self.request, 'CREATE', 'Kategori', f'Menambah kategori "{instance.name}"',
                       target_id=instance.id, new_data={'name': instance.name, 'code': instance.code})
        else:
            raise ValueError("User must be associated with a business")
    
    def perform_update(self, serializer):
        old = self.get_object()
        old_data = {'name': old.name}
        if hasattr(self.request.user, 'business'):
            instance = serializer.save(business=self.request.user.business)
            new_data = {'name': instance.name}
            log_action(self.request, 'UPDATE', 'Kategori', f'Mengubah kategori "{old.name}" → "{instance.name}"',
                       target_id=instance.id, old_data=old_data, new_data=new_data)
        else:
            raise ValueError("User must be associated with a business")

    def perform_destroy(self, instance):
        log_action(self.request, 'DELETE', 'Kategori', f'Menghapus kategori "{instance.name}"',
                   target_id=instance.id, old_data={'name': instance.name, 'code': instance.code})
        instance.delete()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_code_preview(request):
    """
    Generate a code preview for Product, Category, or Supplier.
    
    POST data:
    {
        "name": "Mie Goreng",
        "type": "product|category|supplier"
    }
    
    Returns:
    {
        "code": "MG-X9K2A"
    }
    """
    name = request.data.get('name', '').strip()
    entity_type = request.data.get('type', '').strip().lower()
    
    if not name:
        return Response({
            'error': 'Nama wajib diisi'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Map type to model class
    type_model_map = {
        'product': Product,
        'category': Category,
        'supplier': Supplier,
    }
    
    model_class = type_model_map.get(entity_type)
    if not model_class:
        return Response({
            'error': "Tipe harus salah satu dari: 'product', 'category', 'supplier'"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not hasattr(request.user, 'business'):
        return Response({
            'error': 'User harus terkait dengan bisnis'
        }, status=status.HTTP_403_FORBIDDEN)
    
    business = request.user.business
    code = generate_code(name, model_class, business)
    
    return Response({
        'code': code
    }, status=status.HTTP_200_OK)
