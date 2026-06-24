from django.db import models
from django.utils import timezone
from businesses.models import Business


class Supplier(models.Model):
    """
    Supplier Model
    Multi-tenant: Isolated per business
    
    Used for:
    - Product sourcing tracking
    - Purchase order management
    - Supplier contact information
    """
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='suppliers',
        help_text="Business owner of this supplier"
    )
    code = models.CharField(
        max_length=20,
        help_text="Supplier code (e.g., SUP001, SUP002)"
    )
    name = models.CharField(
        max_length=100,
        help_text="Supplier company name"
    )
    contact_person = models.CharField(
        max_length=100,
        blank=True,
        help_text="Contact person name"
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Contact phone number"
    )
    email = models.EmailField(
        blank=True,
        help_text="Contact email address"
    )
    address = models.TextField(
        blank=True,
        help_text="Supplier address"
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        help_text="City"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this supplier is active"
    )
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'supplier'
        verbose_name = 'Supplier'
        verbose_name_plural = 'Suppliers'
        unique_together = [['business', 'code']]  # Code unique per business
        indexes = [
            models.Index(fields=['business', 'is_active'], name='idx_supplier_business_active'),
            models.Index(fields=['business', 'code'], name='idx_supplier_business_code'),
        ]
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Category(models.Model):
    """
    Product Category Model
    Multi-tenant: Isolated per business
    
    Used for:
    - Product organization and grouping
    - POS filtering
    - Sales reporting by category
    """
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='categories',
        help_text="Business owner of this category"
    )
    code = models.CharField(
        max_length=20,
        help_text="Category code (e.g., MAKANAN, MINUMAN, ELEKTRONIK)"
    )
    name = models.CharField(
        max_length=100,
        help_text="Category name"
    )
    description = models.TextField(
        blank=True,
        help_text="Optional category description"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this category is active"
    )
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'category'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        unique_together = [['business', 'code']]  # Code unique per business
        indexes = [
            models.Index(fields=['business', 'is_active'], name='idx_category_business_active'),
            models.Index(fields=['business', 'code'], name='idx_category_business_code'),
        ]
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Product(models.Model):
    """
    Product Model
    Multi-tenant: Isolated per business
    
    Used for:
    - Product master data
    - Inventory tracking
    - POS sales
    - Pricing management
    """
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='products',
        help_text="Business owner of this product"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products',
        help_text="Product category"
    )
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        help_text="Primary supplier for this product"
    )
    code = models.CharField(
        max_length=30,
        help_text="Product code (SKU)"
    )
    barcode = models.CharField(
        max_length=50,
        blank=True,
        help_text="Barcode / EAN / UPC for scanner input"
    )
    name = models.CharField(
        max_length=100,
        help_text="Product name"
    )
    description = models.TextField(
        blank=True,
        help_text="Optional product description"
    )
    
    # Pricing
    purchase_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Cost price from supplier"
    )
    selling_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Retail selling price"
    )
    
    # Unit tracking
    unit = models.CharField(
        max_length=20,
        default='PCS',
        help_text="Unit type (PCS, BOX, KG, etc.)"
    )
    
    # Stock levels
    min_stock = models.IntegerField(
        default=0,
        help_text="Minimum stock level for reorder alert"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this product is active"
    )
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'product'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        unique_together = [['business', 'code']]  # Code unique per business
        indexes = [
            models.Index(fields=['business', 'is_active'], name='idx_product_business_active'),
            models.Index(fields=['business', 'code'], name='idx_product_business_code'),
            models.Index(fields=['business', 'category'], name='idx_product_business_category'),
        ]
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    @property
    def profit_margin(self):
        """Calculate profit margin percentage"""
        if self.purchase_price == 0 or self.selling_price == 0:
            return 0
        return ((self.selling_price - self.purchase_price) / self.selling_price) * 100
