from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal
from businesses.models import Business
from products.models import Product


class ProductBatch(models.Model):
    """
    Product Batch / Stock Model
    Multi-tenant: Isolated per business
    
    Tracks individual batches of products with:
    - Batch code (for FIFO tracking)
    - Expiry date
    - Current quantity
    - Purchase information
    
    Used for:
    - FIFO (First-In-First-Out) inventory management
    - Expiry date tracking
    - Batch-level stock transactions
    - Inventory valuation
    """
    BATCH_STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
        ('DEPLETED', 'Depleted'),
    )
    
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='product_batches',
        help_text="Business owner of this batch"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='batches',
        help_text="Product this batch belongs to"
    )
    batch_code = models.CharField(
        max_length=50,
        help_text="Batch code (lot number, serial, etc.)"
    )
    quantity = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Current quantity in stock"
    )
    purchase_date = models.DateField(
        default=timezone.now,
        help_text="Date batch was received"
    )
    expiry_date = models.DateField(
        null=True,
        blank=True,
        help_text="Expiry date (null if no expiry)"
    )
    purchase_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total cost of this batch"
    )
    status = models.CharField(
        max_length=20,
        choices=BATCH_STATUS_CHOICES,
        default='ACTIVE',
        help_text="Batch status"
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'product_batch'
        verbose_name = 'Product Batch'
        verbose_name_plural = 'Product Batches'
        unique_together = [['business', 'product', 'batch_code']]
        indexes = [
            models.Index(fields=['business', 'product'], name='idx_batch_business_product'),
            models.Index(fields=['business', 'status'], name='idx_batch_business_status'),
            models.Index(fields=['expiry_date'], name='idx_batch_expiry_date'),
        ]
        ordering = ['purchase_date']  # FIFO: oldest first
    
    def __str__(self):
        return f"{self.product.name} - {self.batch_code} ({self.quantity})"
    
    @property
    def is_expired(self):
        """Check if batch is expired"""
        if self.expiry_date is None:
            return False
        return timezone.localdate() > self.expiry_date
    
    @property
    def days_until_expiry(self):
        """Days remaining before expiry"""
        if self.expiry_date is None:
            return None
        delta = self.expiry_date - timezone.localdate()
        return delta.days


class InventoryMovement(models.Model):
    """
    Inventory Transaction Movement Log
    Multi-tenant: Isolated per business
    
    Audit trail for all inventory changes:
    - Stock in (received from supplier)
    - Stock out (sold via POS or used)
    - Adjustments (inventory count, damage, loss)
    
    Used for:
    - Inventory audit trail
    - Stock movement history
    - Reconciliation
    - FIFO batch selection for transactions
    """
    MOVEMENT_CHOICES = (
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
        ('ADJ', 'Adjustment'),
        ('RETURN', 'Return'),
    )
    
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='inventory_movements',
        help_text="Business"
    )
    batch = models.ForeignKey(
        ProductBatch,
        on_delete=models.CASCADE,
        related_name='movements',
        help_text="Product batch affected"
    )
    movement_type = models.CharField(
        max_length=10,
        choices=MOVEMENT_CHOICES,
        help_text="Type of movement"
    )
    quantity = models.IntegerField(
        help_text="Quantity changed"
    )
    notes = models.TextField(
        blank=True,
        help_text="Reason or notes for movement"
    )
    reference_id = models.CharField(
        max_length=50,
        blank=True,
        help_text="Reference to transaction (e.g., transaction ID)"
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'inventory_movement'
        verbose_name = 'Inventory Movement'
        verbose_name_plural = 'Inventory Movements'
        indexes = [
            models.Index(fields=['business', 'batch'], name='idx_movement_business_batch'),
            models.Index(fields=['created_at'], name='idx_movement_created_at'),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.movement_type} - {self.batch.product.name} x {self.quantity}"


class StockOpname(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved & Applied'),
        ('REJECTED', 'Rejected'),
    )
    
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='stock_opnames'
    )
    document_number = models.CharField(max_length=50, unique=True)
    created_by = models.CharField(max_length=100)
    approved_by = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stock_opname'
        verbose_name = 'Stock Opname'
        verbose_name_plural = 'Stock Opnames'
        ordering = ['-created_at']


class StockOpnameItem(models.Model):
    """
    Stock Opname Item — Batch-Level
    Each item references a specific ProductBatch (not Product).
    Only quantity can be adjusted via opname; batch metadata stays unchanged.
    """
    opname = models.ForeignKey(StockOpname, on_delete=models.CASCADE, related_name='items')
    batch = models.ForeignKey(ProductBatch, on_delete=models.CASCADE, help_text="Batch being audited")
    system_qty = models.IntegerField(help_text="Stock in system at time of opname")
    actual_qty = models.IntegerField(help_text="Actual physical stock counted")
    difference = models.IntegerField(help_text="actual_qty - system_qty")
    
    class Meta:
        db_table = 'stock_opname_item'
