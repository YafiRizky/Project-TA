"""
Custom authentication backends for separated user models.
Handles both TechnicalAdmin and BusinessUser authentication properly.
"""
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from .models import TechnicalAdmin, BusinessUser
from businesses.models import Business


class TechnicalAdminBackend(BaseBackend):
    """
    Authentication backend for Django technical administrators
    
    Purpose: Django admin panel access only
    Authentication: username + password (global unique)
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None
        
        try:
            user = TechnicalAdmin.objects.get(username=username, is_active=True)
            if user.check_password(password):
                return user
        except TechnicalAdmin.DoesNotExist:
            return None
        
        return None
    
    def get_user(self, user_id):
        try:
            return TechnicalAdmin.objects.get(pk=user_id, is_active=True)
        except TechnicalAdmin.DoesNotExist:
            return None


class BusinessUserBackend(BaseBackend):
    """
    Authentication backend for business users (admin + kasir)
    
    Purpose: React frontend POS operations
    Authentication: user_id + business_code + password OR business_code + username + password
    """
    
    def authenticate(self, request, business_code=None, username=None, password=None, user_id=None, owner_code=None, **kwargs):
        """
        Authenticate business user with multiple options:
        1. user_id + password (more precise)
        2. owner_code + username + password (admin login)
        3. business_code + username + password (kasir login)
        4. username + password (admin fallback, no code)
        """
        if not password:
            return None
        
        # Option 1: Authenticate by user_id + password (recommended)
        if user_id:
            try:
                user = BusinessUser.objects.get(pk=user_id, is_active=True)
                if user.check_password(password):
                    return user
            except BusinessUser.DoesNotExist:
                return None
        
        # Option 2: Authenticate Admin by owner_code + username + password
        elif owner_code and username:
            try:
                user = BusinessUser.objects.get(
                    owner_code=owner_code,
                    username=username,
                    role='admin',
                    is_active=True
                )
                if user.check_password(password):
                    return user
            except BusinessUser.DoesNotExist:
                return None
        
        # Option 3: Authenticate Admin without code (fallback)
        elif username and not business_code and not owner_code:
            from django.db.models import Q
            try:
                user = BusinessUser.objects.get(
                    Q(username=username) | Q(email=username),
                    role='admin',
                    is_active=True
                )
                if user.check_password(password):
                    return user
            except (BusinessUser.DoesNotExist, BusinessUser.MultipleObjectsReturned):
                return None
        
        # Option 4: Authenticate Kasir by business_code + username + password
        elif business_code and username:
            try:
                business = Business.objects.get(business_code=business_code, is_active=True)
                user = BusinessUser.objects.get(
                    business=business,
                    username=username,
                    is_active=True
                )
                if user.check_password(password):
                    return user
            except (Business.DoesNotExist, BusinessUser.DoesNotExist):
                return None
        
        return None
    
    def get_user(self, user_id):
        try:
            return BusinessUser.objects.get(pk=user_id, is_active=True)
        except BusinessUser.DoesNotExist:
            return None


class UnifiedAuthBackend(BaseBackend):
    """
    Unified authentication backend that tries all user models
    Automatically detects which type of user is being authenticated based on parameters
    """
    
    def authenticate(self, request, **kwargs):
        """
        Try authentication against all user models based on provided parameters
        """
        # Try TechnicalAdmin first (Django admin)
        # Detects: only username + password (no business_code or user_id)
        if ('username' in kwargs and 'password' in kwargs and 
            'business_code' not in kwargs and 'user_id' not in kwargs):
            admin_backend = TechnicalAdminBackend()
            result = admin_backend.authenticate(request, **kwargs)
            if result:
                return result
        
        # Try BusinessUser (React frontend)
        # Detects: business_code, user_id, or username (if admin)
        if 'business_code' in kwargs or 'user_id' in kwargs or 'username' in kwargs:
            business_backend = BusinessUserBackend()
            result = business_backend.authenticate(request, **kwargs)
            if result:
                return result
        
        return None
    
    def get_user(self, user_id):
        """
        Try to get user from all models
        Note: This assumes user IDs are unique across all models
        """
        # Try TechnicalAdmin first
        try:
            return TechnicalAdmin.objects.get(pk=user_id, is_active=True)
        except TechnicalAdmin.DoesNotExist:
            pass
        
        # Try BusinessUser
        try:
            return BusinessUser.objects.get(pk=user_id, is_active=True)
        except BusinessUser.DoesNotExist:
            pass
        
        return None