"""
Payment methods views for POS system.
Admin manages payment methods, kasir reads active methods.
"""
import os
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from .models import PaymentMethod
from auditlog.utils import log_action

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2MB


def validate_upload_file(file):
    """Validate uploaded image file (extension, size, type)."""
    if not file:
        return None
    
    # Check file size
    if file.size > MAX_IMAGE_SIZE:
        return f'Ukuran file terlalu besar. Maksimum: 2MB (file: {file.size / 1024 / 1024:.1f}MB)'
    
    # Check extension
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        return f'Tipe file tidak diperbolehkan ({ext}). Gunakan: {", ".join(ALLOWED_IMAGE_EXTENSIONS)}'
    
    # Check content type
    allowed_content_types = {'image/jpeg', 'image/png', 'image/webp'}
    if file.content_type not in allowed_content_types:
        return f'Tipe konten file tidak valid ({file.content_type})'
    
    return None



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def payment_method_list_create(request):
    """
    GET: List payment methods (admin: all, kasir: active only)
    POST: Create payment method (admin only)
    """
    business = request.user.business
    
    if request.method == 'GET':
        # Kasir only sees active methods
        if hasattr(request.user, 'role') and request.user.role == 'kasir':
            methods = PaymentMethod.objects.filter(business=business, is_active=True)
        else:
            methods = PaymentMethod.objects.filter(business=business)
        
        data = []
        for m in methods:
            item = {
                'id': m.id,
                'method_type': m.method_type,
                'method_type_display': m.get_method_type_display(),
                'name': m.name,
                'account_number': m.account_number,
                'account_name': m.account_name,
                'instructions': m.instructions,
                'is_active': m.is_active,
                'qris_image': request.build_absolute_uri(m.qris_image.url) if m.qris_image else None,
                'created_at': m.created_at.isoformat(),
            }
            data.append(item)
        
        return Response({'methods': data, 'total': len(data)})
    
    elif request.method == 'POST':
        if not hasattr(request.user, 'role') or request.user.role != 'admin':
            return Response({'error': 'Hanya admin yang dapat mengelola metode pembayaran'}, status=status.HTTP_403_FORBIDDEN)
        
        method_type = request.data.get('method_type', '').strip()
        name = request.data.get('name', '').strip()
        account_number = request.data.get('account_number', '').strip()
        account_name = request.data.get('account_name', '').strip()
        instructions = request.data.get('instructions', '').strip()
        qris_image = request.FILES.get('qris_image')
        
        # Validate uploaded file
        file_error = validate_upload_file(qris_image)
        if file_error:
            return Response({'error': file_error}, status=status.HTTP_400_BAD_REQUEST)
        
        if not method_type:
            return Response({'error': 'Tipe metode pembayaran wajib diisi'}, status=status.HTTP_400_BAD_REQUEST)
        if not name:
            return Response({'error': 'Nama metode pembayaran wajib diisi'}, status=status.HTTP_400_BAD_REQUEST)
        
        valid_types = [t[0] for t in PaymentMethod.METHOD_TYPES]
        if method_type not in valid_types:
            return Response({'error': f'Tipe tidak valid. Pilih: {", ".join(valid_types)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check uniqueness
        if PaymentMethod.objects.filter(business=business, method_type=method_type, name=name).exists():
            return Response({'error': f'{name} ({method_type}) sudah ada'}, status=status.HTTP_400_BAD_REQUEST)
        
        method = PaymentMethod.objects.create(
            business=business,
            method_type=method_type,
            name=name,
            account_number=account_number,
            account_name=account_name,
            instructions=instructions,
            qris_image=qris_image,
            is_active=True,
        )
        
        log_action(request, 'CREATE', 'MetodePembayaran',
                   f'Menambah metode pembayaran "{name}" ({method_type})',
                   target_id=method.id, new_data={'name': name, 'method_type': method_type})
        
        return Response({
            'message': f'Metode pembayaran "{name}" berhasil ditambahkan',
            'method': {
                'id': method.id,
                'method_type': method.method_type,
                'name': method.name,
                'is_active': method.is_active,
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def payment_method_detail(request, method_id):
    """GET/PUT/DELETE a specific payment method"""
    if not hasattr(request.user, 'role') or request.user.role != 'admin':
        return Response({'error': 'Hanya admin yang dapat mengelola metode pembayaran'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        method = PaymentMethod.objects.get(id=method_id, business=request.user.business)
    except PaymentMethod.DoesNotExist:
        return Response({'error': 'Metode pembayaran tidak ditemukan'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({
            'id': method.id,
            'method_type': method.method_type,
            'method_type_display': method.get_method_type_display(),
            'name': method.name,
            'account_number': method.account_number,
            'account_name': method.account_name,
            'instructions': method.instructions,
            'is_active': method.is_active,
            'qris_image': request.build_absolute_uri(method.qris_image.url) if method.qris_image else None,
        })
    
    elif request.method == 'PUT':
        method.name = request.data.get('name', method.name).strip()
        method.account_number = request.data.get('account_number', method.account_number).strip()
        method.account_name = request.data.get('account_name', method.account_name).strip()
        method.instructions = request.data.get('instructions', method.instructions).strip()
        
        if 'is_active' in request.data:
            method.is_active = request.data['is_active'] in [True, 'true', '1']
        
        qris_image = request.FILES.get('qris_image')
        if qris_image:
            file_error = validate_upload_file(qris_image)
            if file_error:
                return Response({'error': file_error}, status=status.HTTP_400_BAD_REQUEST)
            method.qris_image = qris_image
        
        method.save()
        log_action(request, 'UPDATE', 'MetodePembayaran',
                   f'Mengubah metode pembayaran "{method.name}"',
                   target_id=method.id, new_data={'name': method.name, 'is_active': method.is_active})
        return Response({
            'message': f'Metode pembayaran "{method.name}" berhasil diperbarui',
            'method': {
                'id': method.id,
                'method_type': method.method_type,
                'name': method.name,
                'is_active': method.is_active,
            }
        })
    
    elif request.method == 'DELETE':
        name = method.name
        log_action(request, 'DELETE', 'MetodePembayaran',
                   f'Menghapus metode pembayaran "{name}"',
                   target_id=method.id, old_data={'name': name, 'method_type': method.method_type})
        method.delete()
        return Response({'message': f'Metode pembayaran "{name}" berhasil dihapus'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payment_method_toggle(request, method_id):
    """Toggle active status"""
    if not hasattr(request.user, 'role') or request.user.role != 'admin':
        return Response({'error': 'Hanya admin yang dapat mengelola metode pembayaran'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        method = PaymentMethod.objects.get(id=method_id, business=request.user.business)
    except PaymentMethod.DoesNotExist:
        return Response({'error': 'Metode pembayaran tidak ditemukan'}, status=status.HTTP_404_NOT_FOUND)
    
    method.is_active = not method.is_active
    method.save()
    
    return Response({
        'message': f'"{method.name}" {"diaktifkan" if method.is_active else "dinonaktifkan"}',
        'is_active': method.is_active
    })
