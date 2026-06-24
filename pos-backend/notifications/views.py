from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import BusinessUser
from .models import StockNotification
from auditlog.utils import log_action


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """GET: List notifikasi untuk business user (admin melihat semua, kasir melihat miliknya)."""
    user = request.user
    if not isinstance(user, BusinessUser):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    
    qs = StockNotification.objects.filter(business=user.business)
    
    # Filter by read status
    is_read = request.query_params.get('is_read')
    if is_read is not None:
        qs = qs.filter(is_read=is_read.lower() == 'true')
    
    notifications = []
    for n in qs[:50]:
        notifications.append({
            'id': n.id,
            'product_id': n.product_id,
            'product_name': n.product.name if n.product else '',
            'product_code': n.product.code if n.product else '',
            'sender_name': n.sender.full_name or n.sender.username,
            'sender_role': n.sender.role,
            'notif_type': n.notif_type,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat(),
        })
    
    unread_count = StockNotification.objects.filter(business=user.business, is_read=False).count()
    
    return Response({
        'notifications': notifications,
        'unread_count': unread_count,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_create(request):
    """POST: Kasir kirim notifikasi stok ke admin."""
    user = request.user
    if not isinstance(user, BusinessUser):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    
    product_id = request.data.get('product_id')
    notif_type = request.data.get('notif_type', 'LOW_STOCK')
    message = request.data.get('message', '')
    
    if not product_id:
        return Response({'error': 'product_id wajib diisi'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Prevent duplicate: check if unread notification already exists for same product
    existing = StockNotification.objects.filter(
        business=user.business,
        product_id=product_id,
        is_read=False,
    ).first()
    
    if existing:
        return Response({
            'message': 'Notifikasi untuk produk ini sudah dikirim sebelumnya',
            'notification_id': existing.id,
        }, status=status.HTTP_200_OK)
    
    notif = StockNotification.objects.create(
        product_id=product_id,
        sender=user,
        business=user.business,
        notif_type=notif_type,
        message=message,
    )
    
    log_action(request, 'NOTIFY', 'Notifikasi', f'Mengirim peringatan stok untuk produk "{notif.product.name}"',
               target_id=notif.id, new_data={'product': notif.product.name, 'message': message})
    
    return Response({
        'success': True,
        'message': 'Notifikasi berhasil dikirim',
        'notification_id': notif.id,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_read(request, notif_id):
    """POST: Mark notification as read."""
    user = request.user
    if not isinstance(user, BusinessUser):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        notif = StockNotification.objects.get(id=notif_id, business=user.business)
    except StockNotification.DoesNotExist:
        return Response({'error': 'Notifikasi tidak ditemukan'}, status=status.HTTP_404_NOT_FOUND)
    
    notif.is_read = True
    notif.save()
    
    return Response({'success': True, 'message': 'Notifikasi ditandai sudah dibaca'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_all_read(request):
    """POST: Mark all notifications as read for this business."""
    user = request.user
    if not isinstance(user, BusinessUser):
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    
    count = StockNotification.objects.filter(business=user.business, is_read=False).update(is_read=True)
    
    return Response({'success': True, 'message': f'{count} notifikasi ditandai sudah dibaca'})
