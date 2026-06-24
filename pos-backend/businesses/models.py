from django.db import models
from django.utils import timezone
import string
import random


class Business(models.Model):
    """
    Master Tenant - Represents each UMKM business
    Multi-tenant isolation via business_code
    
    Each business is completely isolated:
    - Unique 6-character business code (rotatable for security)
    - Own users (admin + kasir)
    - Own products and transactions
    - Own inventory and reports
    """
    business_code = models.CharField(
        max_length=6,
        unique=True,
        help_text="6 alphanumeric uppercase code (e.g., AB12CD). Rotatable for security."
    )
    business_name = models.CharField(max_length=100)
    business_type = models.CharField(
        max_length=50,
        blank=True,
        help_text="Warung, Toko Kelontong, Minimart, Cafe, etc."
    )
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # Structured address fields
    country = models.CharField(max_length=100, default='Indonesia')
    province = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True, help_text="Kecamatan")
    postal_code = models.CharField(max_length=10, blank=True)
    # Status and timestamps
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'business'
        verbose_name = 'Business'
        verbose_name_plural = 'Businesses'
        indexes = [
            models.Index(fields=['business_code'], name='idx_business_code'),
            models.Index(fields=['is_active'], name='idx_business_active'),
        ]
    
    def __str__(self):
        return f"{self.business_name} ({self.business_code})"
    
    @classmethod
    def generate_business_code(cls):
        """
        Generate a unique 6-character business code
        Format: XXXXXX (uppercase alphanumeric)
        """
        while True:
            characters = string.ascii_uppercase + string.digits
            code = ''.join(random.choice(characters) for _ in range(6))
            if not cls.objects.filter(business_code=code).exists():
                return code
    
    def save(self, *args, **kwargs):
        if not self.business_code:
            self.business_code = self.generate_business_code()
        super().save(*args, **kwargs)


class BusinessCodeHistory(models.Model):
    """
    Audit trail for business code rotation
    Tracks when business code is changed for security purposes
    """
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='code_history'
    )
    old_code = models.CharField(max_length=6, blank=True, null=True)
    new_code = models.CharField(max_length=6)
    reason = models.CharField(
        max_length=200,
        blank=True,
        help_text="Reason for code rotation"
    )
    changed_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'business_code_history'
        verbose_name = 'Business Code History'
        verbose_name_plural = 'Business Code History'
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.business.business_name}: {self.old_code} → {self.new_code}"
