"""
Authentication views for React frontend
Handles login/logout for BusinessUser (admin + kasir)
"""
import logging
from rest_framework import status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db import transaction as db_transaction
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from django.conf import settings
from datetime import timedelta
from django_ratelimit.decorators import ratelimit
from django_ratelimit.exceptions import Ratelimited

from .models import BusinessUser
from businesses.models import Business
from auditlog.utils import log_action

logger = logging.getLogger(__name__)


class BusinessTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer for BusinessUser authentication
    Supports multiple auth methods:
    1. user_id + password (recommended)
    2. business_code + username + password (fallback)  
    """
    business_code = serializers.CharField(required=False)
    username = serializers.CharField(required=False)
    user_id = serializers.IntegerField(required=False)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove default username requirement
        self.fields.pop('username', None)
    
    def validate(self, attrs):
        business_code = attrs.get('business_code')
        username = attrs.get('username') 
        user_id = attrs.get('user_id')
        password = attrs.get('password')
        
        if not password:
            raise serializers.ValidationError('Password wajib diisi')
        
        # Authenticate using custom backend
        user = authenticate(
            request=self.context.get('request'),
            business_code=business_code,
            username=username,
            user_id=user_id,
            password=password
        )
        
        if not user or not isinstance(user, BusinessUser):
            raise serializers.ValidationError('Kredensial tidak valid')
        
        if not user.is_active:
            raise serializers.ValidationError('Akun tidak aktif')
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'email': user.email,
                'role': user.role,
                'business': {
                    'id': user.business.id,
                    'business_code': user.business.business_code,
                    'business_name': user.business.business_name,
                    'business_type': user.business.business_type,
                }
            }
        }


class BusinessTokenObtainPairView(TokenObtainPairView):
    """
    JWT login endpoint for BusinessUser (React frontend)
    """
    serializer_class = BusinessTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='10/m', method='POST', block=False)
def business_login(request):
    """
    Business user login endpoint
    
    Methods:
    1. POST { "user_id": 123, "password": "xxx" }
    2. POST { "business_code": "T2EUNE", "username": "admin01", "password": "xxx" }
    
    Optional:
    - login_as: 'admin' or 'kasir' - validates role before login
    """
    try:
        # Rate limit check
        if getattr(request, 'limited', False):
            logger.warning('Rate limit exceeded for IP: %s', request.META.get('REMOTE_ADDR'))
            return Response({
                'error': 'Terlalu banyak percobaan login. Silakan tunggu 1 menit.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        business_code = request.data.get('business_code')
        owner_code = request.data.get('owner_code')
        username = request.data.get('username')
        user_id = request.data.get('user_id')
        password = request.data.get('password')
        login_as = request.data.get('login_as', '').strip().lower()
        
        if not password:
            return Response({
                'error': 'Password wajib diisi'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user  
        user = authenticate(
            request=request,
            business_code=business_code,
            owner_code=owner_code,
            username=username,
            user_id=user_id,
            password=password
        )
        
        if not user or not isinstance(user, BusinessUser):
            return Response({
                'error': 'Kredensial tidak valid'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'Akun tidak aktif'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Validate login_as role if provided
        if login_as:
            if login_as == 'admin' and user.role != 'admin':
                return Response({
                    'error': 'Akun ini adalah akun Kasir. Silakan pilih tab Kasir untuk login.'
                }, status=status.HTTP_403_FORBIDDEN)
            elif login_as == 'kasir' and user.role != 'kasir':
                return Response({
                    'error': 'Akun ini adalah akun Admin/Owner. Silakan pilih tab Admin untuk login.'
                }, status=status.HTTP_403_FORBIDDEN)
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Generate JWT tokens - Custom approach for multiple user models
        from rest_framework_simplejwt.tokens import AccessToken
        from datetime import datetime
        
        # Create access token manually
        access_token = AccessToken()
        access_token['user_id'] = user.id
        access_token['username'] = user.username  
        access_token['business_code'] = user.business.business_code if user.business else None
        access_token['role'] = user.role
        access_token['user_type'] = 'BusinessUser'
        access_token.set_exp(lifetime=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'])
        
        # Create simple refresh token (without blacklist dependency)
        refresh_token = AccessToken()
        refresh_token['user_id'] = user.id
        refresh_token['token_type'] = 'refresh'
        refresh_token['user_type'] = 'BusinessUser'
        refresh_token.set_exp(lifetime=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'])
        
        log_action(request, 'LOGIN', 'User', f'Login berhasil sebagai {user.get_role_display()}', target_id=user.id, user=user)
        
        return Response({
            'success': True,
            'message': 'Login berhasil',
            'tokens': {
                'refresh': str(refresh_token),
                'access': str(access_token),
            },
            'user': {
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'email': user.email,
                'role': user.role,
                'role_display': user.get_role_display(),
                'owner_code': user.owner_code if user.role == 'admin' else None,
                'business': {
                    'id': user.business.id,
                    'business_code': user.business.business_code,
                    'business_name': user.business.business_name,
                    'business_type': user.business.business_type,
                } if user.business else None
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error('Login error: %s', str(e))
        return Response({
            'error': 'Terjadi kesalahan server. Silakan coba lagi.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'PATCH'])
def user_profile(request):
    """
    Get or update current user profile (requires JWT authentication)
    
    GET: Return current user data
    PUT/PATCH: Update user profile
    
    PUT/PATCH data (all optional):
    {
        "full_name": "New Name",
        "email": "new@email.com",
        "old_password": "current_password",     # required for password change
        "new_password": "new_password",         # required for password change
        "confirm_password": "new_password"      # required for password change
    }
    """
    if request.user.is_anonymous:
        return Response({
            'error': 'Autentikasi diperlukan'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    if not isinstance(request.user, BusinessUser):
        return Response({
            'error': 'Tipe pengguna tidak valid'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user = request.user
    
    if request.method == 'GET':
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'email': user.email,
                'role': user.role,
                'role_display': user.get_role_display(),
                'schedule': user.schedule,
                'owner_code': user.owner_code if user.role == 'admin' else None,
                'business': {
                    'id': user.business.id,  
                    'business_code': user.business.business_code,
                    'business_name': user.business.business_name,
                    'business_type': user.business.business_type,
                } if user.business else None
            }
        }, status=status.HTTP_200_OK)
    
    # PUT/PATCH: Update profile (name and email only)
    # Update full_name if provided
    full_name = request.data.get('full_name')
    if full_name is not None:
        user.full_name = full_name.strip()
    
    # Update email if provided
    email = request.data.get('email')
    if email is not None:
        email = email.strip()
        # FIX 9: Validate email format
        if email:
            try:
                validate_email(email)
            except DjangoValidationError:
                return Response({'error': 'Format email tidak valid.'}, status=status.HTTP_400_BAD_REQUEST)
        user.email = email
    
    user.save()
    
    return Response({
        'success': True,
        'message': 'Profil berhasil diperbarui',
        'user': {
            'id': user.id,
            'username': user.username,
            'full_name': user.full_name,
            'email': user.email,
            'role': user.role,
            'role_display': user.get_role_display(),
            'schedule': user.schedule,
            'business': {
                'id': user.business.id,
                'business_code': user.business.business_code,
                'business_name': user.business.business_name,
                'business_type': user.business.business_type,
            }
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Endpoint terpisah untuk ubah password user."""
    if not isinstance(request.user, BusinessUser):
        return Response({'error': 'Tipe pengguna tidak valid'}, status=status.HTTP_403_FORBIDDEN)
    
    user = request.user
    old_password = request.data.get('old_password', '')
    new_password = request.data.get('new_password', '')
    
    if not old_password:
        return Response({'error': 'Password lama wajib diisi'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not new_password:
        return Response({'error': 'Password baru wajib diisi'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not user.check_password(old_password):
        return Response({'error': 'Password lama tidak sesuai'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 6:
        return Response({'error': 'Password baru minimal 6 karakter'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    log_action(request, 'PASSWORD', 'User', 'Mengganti password akun sendiri', target_id=user.id)
    
    return Response({
        'success': True,
        'message': 'Password berhasil diubah'
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'PATCH'])
def business_profile(request):
    """
    Get or update current user's business profile (admin only)
    
    GET: Return full business data
    PUT/PATCH: Update business fields
    
    Updatable fields:
    - business_name, business_type, phone, address
    - country, province, city, district, postal_code
    """
    if request.user.is_anonymous:
        return Response({
            'error': 'Autentikasi diperlukan'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    if not isinstance(request.user, BusinessUser):
        return Response({
            'error': 'Tipe pengguna tidak valid'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user = request.user
    
    # Only admin can manage business profile
    if user.role != 'admin':
        return Response({
            'error': 'Hanya admin yang dapat mengelola profil bisnis'
        }, status=status.HTTP_403_FORBIDDEN)
    
    business = user.business
    
    if not business:
        return Response({
            'error': 'Bisnis tidak ditemukan. Silakan pilih bisnis terlebih dahulu.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({
            'id': business.id,
            'business_code': business.business_code,
            'business_name': business.business_name,
            'business_type': business.business_type,
            'phone': business.phone,
            'address': business.address,
            'country': business.country,
            'province': business.province,
            'city': business.city,
            'district': business.district,
            'postal_code': business.postal_code,
        }, status=status.HTTP_200_OK)
    
    # PUT/PATCH: Update business
    updatable_fields = [
        'business_name', 'business_type', 'phone', 'address',
        'country', 'province', 'city', 'district', 'postal_code'
    ]
    
    for field in updatable_fields:
        value = request.data.get(field)
        if value is not None:
            setattr(business, field, value.strip() if isinstance(value, str) else value)
    
    # Validate business_name is not empty
    if not business.business_name or not business.business_name.strip():
        return Response({
            'error': 'Nama bisnis tidak boleh kosong'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    business.save()
    
    return Response({
        'success': True,
        'message': 'Profil bisnis berhasil diperbarui',
        'id': business.id,
        'business_code': business.business_code,
        'business_name': business.business_name,
        'business_type': business.business_type,
        'phone': business.phone,
        'address': business.address,
        'country': business.country,
        'province': business.province,
        'city': business.city,
        'district': business.district,
        'postal_code': business.postal_code,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """
    Logout endpoint - simplified (no blacklist)
    Frontend will clear tokens from localStorage
    """
    return Response({
        'success': True,
        'message': 'Logout berhasil'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_business(request):
    """
    Business registration endpoint
    
    Creates new business + admin user account
    
    POST data:
    {
        "business_name": "Warung Maju",
        "business_type": "Warung Kelontong",
        "phone": "081234567890",
        "address": "Jl. Example No. 123",
        "username": "admin_warung",
        "email": "admin@warung.com",
        "full_name": "Pak Budi",
        "password": "password123"
    }
    """
    try:
        # Validate required fields
        required_fields = ['business_name', 'business_type', 'username', 'password']
        missing_fields = [field for field in required_fields if not request.data.get(field)]
        
        if missing_fields:
            return Response({
                'success': False,
                'error': 'Field yang diperlukan belum diisi',
                'missing_fields': missing_fields
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate full_name, email, phone are required
        errors = {}
        if not request.data.get('full_name', '').strip():
            errors['full_name'] = 'Nama lengkap wajib diisi'
        if not request.data.get('email', '').strip():
            errors['email'] = 'Email wajib diisi'
        if not request.data.get('phone', '').strip():
            errors['phone'] = 'Nomor telepon wajib diisi'
        
        if errors:
            return Response({
                'success': False,
                'error': 'Validasi gagal',
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Enforce global username/email uniqueness for Admins
        from django.db.models import Q
        username = request.data.get('username')
        email = request.data.get('email', '').strip()
        
        if BusinessUser.objects.filter(Q(username=username) | Q(email=email), role='admin').exists():
            return Response({
                'success': False,
                'error': 'Username atau Email sudah terdaftar sebagai Pemilik Bisnis.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # FIX 9: Validate email format
        email = request.data.get('email', '').strip()
        if email:
            try:
                validate_email(email)
            except DjangoValidationError:
                return Response({'error': 'Format email tidak valid.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract data
        business_data = {
            'business_name': request.data.get('business_name'),
            'business_type': request.data.get('business_type'),
            'phone': request.data.get('phone', ''),
            'address': request.data.get('address', ''),
            'country': request.data.get('country', 'Indonesia'),
            'province': request.data.get('province', ''),
            'city': request.data.get('city', ''),
            'district': request.data.get('district', ''),
            'postal_code': request.data.get('postal_code', ''),
        }
        
        user_data = {
            'username': request.data.get('username'),
            'email': email,
            'full_name': request.data.get('full_name', ''),
            'password': request.data.get('password'),
        }
        
        # FIX 2: Wrap business + user creation in atomic block
        with db_transaction.atomic():
            # Create Business
            business = Business.objects.create(**business_data)
            
            # Create Business Admin User
            admin_user = BusinessUser.objects.create_business_admin(
                username=user_data['username'],
                password=user_data['password'],
                business=None,  # Primary business is null for admin
                email=user_data['email'],
                full_name=user_data['full_name']
            )
            # Generate unique owner code for admin login
            admin_user.owner_code = BusinessUser.generate_owner_code()
            admin_user.save(update_fields=['owner_code'])
            # Add to owned businesses
            admin_user.owned_businesses.add(business)
        
        # Generate JWT tokens for auto-login
        from rest_framework_simplejwt.tokens import AccessToken
        
        access_token = AccessToken()
        access_token['user_id'] = admin_user.id
        access_token['username'] = admin_user.username  
        access_token['business_code'] = None  # Admins start without active business context
        access_token['role'] = admin_user.role
        access_token['user_type'] = 'BusinessUser'
        access_token.set_exp(lifetime=timedelta(minutes=60))  # 1 hour expiry
        
        refresh_token = AccessToken()
        refresh_token['user_id'] = admin_user.id
        refresh_token['token_type'] = 'refresh'
        refresh_token['user_type'] = 'BusinessUser'
        refresh_token.set_exp(lifetime=timedelta(days=7))
        
        return Response({
            'success': True,
            'message': 'Bisnis berhasil didaftarkan',
            'business': {
                'id': business.id,
                'business_code': business.business_code,
                'business_name': business.business_name,
                'business_type': business.business_type,
            },
            'user': {
                'id': admin_user.id,
                'username': admin_user.username,
                'email': admin_user.email,
                'full_name': admin_user.full_name,
                'role': admin_user.role,
                'role_display': admin_user.get_role_display(),
                'owner_code': admin_user.owner_code,
            },
            'tokens': {
                'access': str(access_token),
                'refresh': str(refresh_token),
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error('Registration error: %s', str(e))
        return Response({
            'success': False,
            'error': 'Terjadi kesalahan server. Silakan coba lagi.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================================================
# KASIR MANAGEMENT ENDPOINTS (Admin only)
# =============================================================================

from rest_framework.permissions import IsAuthenticated


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def kasir_list_create(request):
    """
    GET: List all kasir users for the admin's business
    POST: Create a new kasir user
    """
    # Only admin can manage kasir
    if not hasattr(request.user, 'role') or request.user.role != 'admin':
        return Response({'error': 'Hanya admin yang dapat mengelola kasir'}, status=status.HTTP_403_FORBIDDEN)
    
    business = request.user.business
    if not business:
        return Response({'error': 'Admin tidak berada dalam konteks bisnis (pilih cabang terlebih dahulu)'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        kasir_list = BusinessUser.objects.filter(
            business=business, role='kasir'
        ).order_by('-created_at')
        
        data = []
        for k in kasir_list:
            data.append({
                'id': k.id,
                'username': k.username,
                'full_name': k.full_name,
                'email': k.email,
                'schedule': k.schedule,
                'is_active': k.is_active,
                'created_at': k.created_at.isoformat() if k.created_at else None,
                'last_login': k.last_login.isoformat() if k.last_login else None,
            })
        
        return Response({'kasir': data, 'total': len(data)})
    
    elif request.method == 'POST':
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        full_name = request.data.get('full_name', '').strip()
        email = request.data.get('email', '').strip()
        schedule = request.data.get('schedule', '').strip()
        
        # Validation
        if not username or len(username) < 3:
            return Response({'error': 'Username wajib diisi (min 3 karakter)'}, status=status.HTTP_400_BAD_REQUEST)
        if not password or len(password) < 6:
            return Response({'error': 'Password wajib diisi (min 6 karakter)'}, status=status.HTTP_400_BAD_REQUEST)
        if not full_name:
            return Response({'error': 'Nama lengkap wajib diisi'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check unique username within business
        if BusinessUser.objects.filter(business=business, username=username).exists():
            return Response({'error': f'Username "{username}" sudah digunakan di bisnis ini'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create kasir
        kasir = BusinessUser(
            business=business,
            username=username,
            full_name=full_name,
            email=email,
            role='kasir',
            schedule=schedule,
            is_active=True,
        )
        kasir.set_password(password)
        kasir.save()
        
        log_action(request, 'CREATE', 'Kasir', f'Menambah akun kasir "{full_name}"',
                   target_id=kasir.id, new_data={'username': username, 'full_name': full_name, 'email': email})
        
        return Response({
            'message': f'Kasir "{full_name}" berhasil dibuat',
            'kasir': {
                'id': kasir.id,
                'username': kasir.username,
                'full_name': kasir.full_name,
                'email': kasir.email,
                'schedule': kasir.schedule,
                'is_active': kasir.is_active,
                'created_at': kasir.created_at.isoformat() if kasir.created_at else None,
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def kasir_detail(request, kasir_id):
    """
    GET: Get kasir detail
    PUT: Update kasir info
    DELETE: Delete/deactivate kasir
    """
    if not hasattr(request.user, 'role') or request.user.role != 'admin':
        return Response({'error': 'Hanya admin yang dapat mengelola kasir'}, status=status.HTTP_403_FORBIDDEN)
    
    business = request.user.business
    
    try:
        kasir = BusinessUser.objects.get(id=kasir_id, business=business, role='kasir')
    except BusinessUser.DoesNotExist:
        return Response({'error': 'Kasir tidak ditemukan'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({
            'id': kasir.id,
            'username': kasir.username,
            'full_name': kasir.full_name,
            'email': kasir.email,
            'schedule': kasir.schedule,
            'is_active': kasir.is_active,
            'created_at': kasir.created_at.isoformat() if kasir.created_at else None,
            'last_login': kasir.last_login.isoformat() if kasir.last_login else None,
        })
    
    elif request.method == 'PUT':
        full_name = request.data.get('full_name', kasir.full_name).strip()
        email = request.data.get('email', kasir.email).strip()
        schedule = request.data.get('schedule', kasir.schedule).strip()
        username = request.data.get('username', kasir.username).strip()
        
        # Check username uniqueness if changed
        if username != kasir.username:
            if BusinessUser.objects.filter(business=business, username=username).exists():
                return Response({'error': f'Username "{username}" sudah digunakan'}, status=status.HTTP_400_BAD_REQUEST)
            kasir.username = username
        
        kasir.full_name = full_name
        kasir.email = email
        kasir.schedule = schedule
        kasir.save()
        
        log_action(request, 'UPDATE', 'Kasir', f'Mengubah data kasir "{kasir.full_name}"',
                   target_id=kasir.id, new_data={'username': username, 'full_name': full_name, 'email': email, 'schedule': schedule})
        
        return Response({
            'message': f'Data kasir "{kasir.full_name}" berhasil diperbarui',
            'kasir': {
                'id': kasir.id,
                'username': kasir.username,
                'full_name': kasir.full_name,
                'email': kasir.email,
                'schedule': kasir.schedule,
                'is_active': kasir.is_active,
            }
        })
    
    elif request.method == 'DELETE':
        kasir_name = kasir.full_name
        # Soft delete -- deactivate instead of hard delete
        kasir.is_active = False
        kasir.save()
        log_action(request, 'DELETE', 'Kasir', f'Menonaktifkan kasir "{kasir_name}"', target_id=kasir.id)
        return Response({'message': f'Kasir "{kasir_name}" berhasil dinonaktifkan'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kasir_toggle_status(request, kasir_id):
    """Toggle kasir active/inactive status"""
    if not hasattr(request.user, 'role') or request.user.role != 'admin':
        return Response({'error': 'Hanya admin yang dapat mengelola kasir'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        kasir = BusinessUser.objects.get(id=kasir_id, business=request.user.business, role='kasir')
    except BusinessUser.DoesNotExist:
        return Response({'error': 'Kasir tidak ditemukan'}, status=status.HTTP_404_NOT_FOUND)
    
    kasir.is_active = not kasir.is_active
    kasir.save()
    
    status_text = 'diaktifkan' if kasir.is_active else 'dinonaktifkan'
    log_action(request, 'UPDATE', 'Kasir', f'Kasir "{kasir.full_name}" {status_text}', target_id=kasir.id)
    
    return Response({
        'message': f'Kasir "{kasir.full_name}" berhasil {status_text}',
        'is_active': kasir.is_active
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kasir_reset_password(request, kasir_id):
    """Reset kasir password"""
    if not hasattr(request.user, 'role') or request.user.role != 'admin':
        return Response({'error': 'Hanya admin yang dapat mengelola kasir'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        kasir = BusinessUser.objects.get(id=kasir_id, business=request.user.business, role='kasir')
    except BusinessUser.DoesNotExist:
        return Response({'error': 'Kasir tidak ditemukan'}, status=status.HTTP_404_NOT_FOUND)
    
    new_password = request.data.get('new_password', '')
    if not new_password or len(new_password) < 6:
        return Response({'error': 'Password baru minimal 6 karakter'}, status=status.HTTP_400_BAD_REQUEST)
    kasir.set_password(new_password)
    kasir.save()
    log_action(request, 'UPDATE', 'Kasir', f'Reset password kasir "{kasir.full_name}"', target_id=kasir.id)
        
    return Response({'message': f'Password kasir "{kasir.full_name}" berhasil direset'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_businesses(request):
    """List all businesses owned by this admin"""
    user = request.user
    if getattr(user, 'role', '') != 'admin':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    businesses = user.owned_businesses.all().order_by('created_at')
    data = [{
        'id': b.id,
        'business_code': b.business_code,
        'business_name': b.business_name,
        'business_type': b.business_type,
        'address': b.address,
    } for b in businesses]
    
    return Response({'businesses': data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def switch_branch(request):
    """Generate new token for a specific branch"""
    user = request.user
    if getattr(user, 'role', '') != 'admin':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
    business_code = request.data.get('business_code')
    if not business_code:
        return Response({'error': 'business_code required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        business = user.owned_businesses.get(business_code=business_code)
    except Exception:
        return Response({'error': 'Bisnis tidak ditemukan atau tidak memiliki akses'}, status=status.HTTP_404_NOT_FOUND)
        
    # Generate new tokens using manual approach (same as login)
    # Cannot use RefreshToken.for_user() because AUTH_USER_MODEL is TechnicalAdmin
    from rest_framework_simplejwt.tokens import AccessToken
    
    access_token = AccessToken()
    access_token['user_id'] = user.id
    access_token['username'] = user.username
    access_token['business_code'] = business.business_code
    access_token['role'] = user.role
    access_token['user_type'] = 'BusinessUser'
    access_token.set_exp(lifetime=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'])
    
    refresh_token = AccessToken()
    refresh_token['user_id'] = user.id
    refresh_token['token_type'] = 'refresh'
    refresh_token['business_code'] = business.business_code
    refresh_token['user_type'] = 'BusinessUser'
    refresh_token.set_exp(lifetime=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'])
    
    return Response({
        'success': True,
        'tokens': {
            'refresh': str(refresh_token),
            'access': str(access_token),
        },
        'business': {
            'id': business.id,
            'business_code': business.business_code,
            'business_name': business.business_name,
            'business_type': business.business_type,
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_branch(request):
    """Admin endpoint to create a new business branch"""
    user = request.user
    if getattr(user, 'role', '') != 'admin':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
    business_name = request.data.get('business_name')
    if not business_name:
        return Response({'error': 'Nama bisnis wajib diisi'}, status=status.HTTP_400_BAD_REQUEST)
        
    from django.db import transaction
    with transaction.atomic():
        business = Business.objects.create(
            business_name=business_name,
            business_type=request.data.get('business_type', ''),
            phone=request.data.get('phone', ''),
            address=request.data.get('address', ''),
            country=request.data.get('country', 'Indonesia'),
            province=request.data.get('province', ''),
            city=request.data.get('city', ''),
            district=request.data.get('district', ''),
            postal_code=request.data.get('postal_code', ''),
        )
        user.owned_businesses.add(business)
        
        log_action(request, 'CREATE', 'Bisnis',
                   f'Membuat cabang baru "{business_name}"',
                   target_id=business.id,
                   new_data={'business_code': business.business_code,
                             'business_name': business_name})
        
    return Response({
        'success': True,
        'message': 'Cabang baru berhasil dibuat',
        'business': {
            'id': business.id,
            'business_code': business.business_code,
            'business_name': business.business_name,
            'business_type': business.business_type,
            'address': business.address,
        }
    }, status=status.HTTP_201_CREATED)


