from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone
import random
import string


# =====================================================================================
# TECHNICAL ADMIN MODEL - Django Superuser Only
# =====================================================================================

class TechnicalAdminManager(BaseUserManager):
    """
    Manager for Django technical administrators - NO business association
    """
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Technical admin must have a username')
        
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        return self.create_user(username, password, **extra_fields)


class TechnicalAdmin(AbstractBaseUser):
    """
    Django Technical Administrator - Completely separated from business operations
    
    Purpose:
    - Django admin panel access only
    - Database management and debugging
    - System maintenance
    - NO business association whatsoever
    
    Authentication: 
    - Username (global unique)
    - Password
    """
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True, null=True)
    full_name = models.CharField(max_length=100, blank=True)
    
    # Django required fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    
    objects = TechnicalAdminManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'technical_admin'
        verbose_name = 'Technical Administrator'
        verbose_name_plural = 'Technical Administrators'
    
    def __str__(self):
        return f"Tech Admin: {self.username}"
    
    def has_perm(self, perm, obj=None):
        return self.is_superuser
    
    def has_module_perms(self, app_label):
        return self.is_superuser


# =====================================================================================
# BUSINESS USER MODEL - Business Operations (Admin + Kasir)
# =====================================================================================

class BusinessUserManager(BaseUserManager):
    """
    Manager for business users - Multi-tenant business operations
    """
    def create_user(self, business, username, password=None, **extra_fields):
        if extra_fields.get('role') == 'kasir' and not business:
            raise ValueError('Kasir user must have a business')
        if not username:
            raise ValueError('Business user must have a username')
        
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        
        user = self.model(
            business=business,
            username=username,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_business_admin(self, username, password=None, business=None, **extra_fields):
        """Create business owner/admin"""
        extra_fields.setdefault('role', 'admin')
        user = self.create_user(business, username, password, **extra_fields)
        if business:
            user.owned_businesses.add(business)
        return user
    
    def create_kasir(self, business, username, password=None, **extra_fields):
        """Create kasir user"""
        extra_fields.setdefault('role', 'kasir')
        return self.create_user(business, username, password, **extra_fields)


class BusinessUser(AbstractBaseUser):
    """
    Business User Model - Multi-tenant POS operations
    
    Purpose:
    - Business admin/owners: Full business management
    - Kasir: Transaction processing with limited access
    - Isolated per business (multi-tenant)
    - NO Django admin permissions
    
    Authentication:
    - User ID (primary key)
    - Business code (for business context)
    - Password
    """
    ROLE_CHOICES = [
        ('admin', 'Business Admin/Owner'),
        ('kasir', 'Kasir/Cashier'),
    ]
    
    business = models.ForeignKey(
        'businesses.Business',
        on_delete=models.CASCADE,
        related_name='business_users',
        null=True, blank=True,
        help_text="Primary business context for Kasir. Null for Admin."
    )
    owned_businesses = models.ManyToManyField(
        'businesses.Business',
        related_name='owner_users',
        blank=True,
        help_text="Businesses owned by this Admin."
    )
    username = models.CharField(max_length=50)
    email = models.EmailField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')
    full_name = models.CharField(max_length=100, blank=True)
    schedule = models.CharField(
        max_length=100,
        blank=True,
        help_text="Kasir work schedule: e.g., 'senin,selasa,rabu'"
    )
    owner_code = models.CharField(
        max_length=6,
        blank=True,
        null=True,
        unique=True,
        help_text="Unique 6-char code for admin login identity. Only for role=admin."
    )
    
    # Django required fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)      # NO Django admin access
    is_superuser = models.BooleanField(default=False)  # NO Django superuser
    
    created_at = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    
    objects = BusinessUserManager()
    
    USERNAME_FIELD = 'id'  # Use ID since username not globally unique
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'business_user'
        verbose_name = 'Business User'
        verbose_name_plural = 'Business Users'
        unique_together = [['business', 'username']]  # Username unique per business
        indexes = [
            models.Index(fields=['business'], name='idx_business_user_business'),
            models.Index(fields=['business', 'username', 'is_active'], name='idx_business_user_login'),
            models.Index(fields=['role'], name='idx_business_user_role'),
            models.Index(fields=['owner_code'], name='idx_business_user_owner_code'),
        ]
    
    def __str__(self):
        if self.role == 'admin':
            return f"{self.username} (Owner)"
        return f"{self.username} ({self.get_role_display()}) - {self.business.business_name if self.business else 'No Business'}"
    
    def has_perm(self, perm, obj=None):
        # Business users have NO Django admin permissions
        return False
    
    def has_module_perms(self, app_label):
        # Business users have NO Django admin permissions
        return False
    
    # Business logic methods
    def is_admin(self):
        """Check if user is business admin/owner"""
        return self.role == 'admin'
    
    def is_kasir(self):
        """Check if user is kasir"""
        return self.role == 'kasir'
    
    def can_manage_users(self):
        """Only admin can manage kasir users"""
        return self.role == 'admin'
    
    def can_access_reports(self):
        """Only admin can access business reports"""
        return self.role == 'admin'
    
    def can_process_transactions(self):
        """Both admin and kasir can process transactions"""
        return True
    
    @property
    def business_code(self):
        return self.business.business_code

    @staticmethod
    def generate_owner_code():
        """Generate a unique 6-character alphanumeric owner code (uppercase + digits)"""
        chars = string.ascii_uppercase + string.digits
        for _ in range(100):
            code = ''.join(random.choice(chars) for _ in range(6))
            if not BusinessUser.objects.filter(owner_code=code).exists():
                return code
        raise ValueError('Could not generate a unique owner code')
