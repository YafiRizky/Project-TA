from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import DiscountRule
from .serializers import DiscountRuleSerializer
from accounts.models import BusinessUser
from auditlog.utils import log_action

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def discount_list_create(request):
    """
    GET: List all discount rules for the business (admin only)
    POST: Create a new discount rule
    """
    user = request.user
    if not isinstance(user, BusinessUser):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        if user.role != 'admin':
            return Response({'error': 'Hanya admin yang dapat mengelola diskon'}, status=status.HTTP_403_FORBIDDEN)
            
        discounts = DiscountRule.objects.filter(business=user.business).order_by('-created_at')
        serializer = DiscountRuleSerializer(discounts, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        if user.role != 'admin':
            return Response({'error': 'Hanya admin yang dapat membuat diskon'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = DiscountRuleSerializer(data=request.data)
        if serializer.is_valid():
            discount = serializer.save(business=user.business)
            
            # Use multi-select (M2M) from request data if provided
            products_data = request.data.get('products', [])
            if products_data:
                discount.products.set(products_data)
                
            # Logging
            log_action(
                request, 'CREATE', 'Diskon', f'Membuat aturan diskon baru "{discount.name}"',
                target_id=discount.id, new_data=serializer.data
            )
            
            return Response({
                'success': True,
                'message': 'Aturan diskon berhasil ditambahkan',
                'data': DiscountRuleSerializer(discount).data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def discount_detail(request, pk):
    """
    GET, PUT, DELETE for specific discount rule
    """
    user = request.user
    if not isinstance(user, BusinessUser) or user.role != 'admin':
        return Response({'error': 'Hanya admin yang dapat mengelola diskon'}, status=status.HTTP_403_FORBIDDEN)
        
    discount = get_object_or_404(DiscountRule, pk=pk, business=user.business)
    
    if request.method == 'GET':
        serializer = DiscountRuleSerializer(discount)
        return Response(serializer.data)
        
    elif request.method == 'PUT':
        old_data = DiscountRuleSerializer(discount).data
        serializer = DiscountRuleSerializer(discount, data=request.data, partial=True)
        
        if serializer.is_valid():
            updated_discount = serializer.save()
            
            if 'products' in request.data:
                updated_discount.products.set(request.data['products'])
                
            log_action(
                request, 'UPDATE', 'Diskon', f'Memperbarui aturan diskon "{updated_discount.name}"',
                target_id=updated_discount.id, old_data=old_data, new_data=DiscountRuleSerializer(updated_discount).data
            )
            
            return Response({
                'success': True,
                'message': 'Aturan diskon berhasil diperbarui',
                'data': DiscountRuleSerializer(updated_discount).data
            })
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        discount_name = discount.name
        discount_id = discount.id
        discount.delete()
        
        log_action(
            request, 'DELETE', 'Diskon', f'Menghapus aturan diskon "{discount_name}"',
            target_id=discount_id
        )
        
        return Response({
            'success': True,
            'message': 'Aturan diskon berhasil dihapus'
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def active_discounts(request):
    """
    GET: Get all active discount rules (for Kasir POS calculation)
    """
    user = request.user
    if not isinstance(user, BusinessUser):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        
    now = timezone.now()
    discounts = DiscountRule.objects.filter(
        business=user.business,
        is_active=True
    ).exclude(start_date__gt=now).exclude(end_date__lt=now)
    
    # Alternatively, you might just use `is_active=True` without dates if dates are null
    # If start/end dates are optional, we need a complex query:
    from django.db.models import Q
    discounts = DiscountRule.objects.filter(business=user.business, is_active=True).filter(
        Q(start_date__isnull=True) | Q(start_date__lte=now),
        Q(end_date__isnull=True) | Q(end_date__gte=now)
    ).order_by('-created_at')
    
    serializer = DiscountRuleSerializer(discounts, many=True)
    return Response(serializer.data)
