from django.db import models
from django.utils import timezone
from decimal import Decimal
from businesses.models import Business
from products.models import Product
from inventory.models import ProductBatch


class Transaction(models.Model):
    """
    Sales Transaction / Invoice Model
    Multi-tenant: Isolated per business
    
    Represents a complete POS sale with:
    - Multiple line items
    - Payment information
    - Timestamps for audit
    
    Used for:
    - POS sales recording
    - Revenue tracking
    - Sales reporting
    - Customer receipts
    """
    PAYMENT_METHOD_CHOICES = (
        ('CASH', 'Cash'),
        ('CARD', 'Card/Debit'),
        ('QRIS', 'QRIS'),
        ('TRANSFER', 'Bank Transfer'),
        ('EWALLET', 'E-Wallet'),
        ('MIXED', 'Mixed Payment'),
        ('XENDIT', 'Xendit Digital Payment'),
    )
    
    TRANSACTION_STATUS_CHOICES = (
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('PENDING', 'Pending'),
        ('VOIDED', 'Voided'),
    )
    
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name='transactions',
        help_text="Business owner of this transaction"
    )
    transaction_code = models.CharField(
        max_length=30,
        unique=True,
        help_text="Unique transaction ID (receipt number)"
    )
    total_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total amount (after discount)"
    )
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Total discount given"
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='CASH',
        help_text="Payment method used"
    )
    amount_paid = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Amount paid by customer"
    )
    change_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Change returned to customer"
    )
    status = models.CharField(
        max_length=20,
        choices=TRANSACTION_STATUS_CHOICES,
        default='COMPLETED',
        help_text="Transaction status"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional transaction notes"
    )
    
    # Audit fields
    cashier_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Cashier/operator name (for audit)"
    )
    transaction_date = models.DateTimeField(
        default=timezone.now,
        help_text="Date and time of transaction"
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Double-submit prevention
    idempotency_key = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        unique=True,
        help_text="Client-generated unique key to prevent double submissions"
    )
    
    # Void/refund audit fields
    voided_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this transaction was voided"
    )
    voided_by = models.CharField(
        max_length=100,
        blank=True,
        help_text="Who voided this transaction"
    )
    void_reason = models.TextField(
        blank=True,
        help_text="Reason for voiding this transaction"
    )
    
    class Meta:
        db_table = 'transaction'
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        indexes = [
            models.Index(fields=['business', 'transaction_date'], name='idx_trans_business_date'),
            models.Index(fields=['business', 'status'], name='idx_trans_business_status'),
            models.Index(fields=['transaction_code'], name='idx_trans_code'),
        ]
        ordering = ['-transaction_date']
    
    def __str__(self):
        return f"{self.transaction_code} - {self.total_amount}"
    
    @property
    def item_count(self):
        """Total number of items in transaction"""
        return self.items.aggregate(models.Sum('quantity'))['quantity__sum'] or 0


class TransactionItem(models.Model):
    """
    Transaction Line Item Model
    
    Individual items in a transaction:
    - Product and quantity
    - Price per unit
    - Batch/lot tracking for FIFO
    
    Used for:
    - Line item details
    - Inventory FIFO selection
    - Product sales tracking
    """
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='items',
        help_text="Parent transaction"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='transaction_items',
        help_text="Product sold"
    )
    batch = models.ForeignKey(
        ProductBatch,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        help_text="Batch/lot used for this item (FIFO)"
    )
    quantity = models.IntegerField(
        help_text="Quantity sold"
    )
    price_per_unit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Price per unit at time of sale"
    )
    subtotal = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        help_text="Quantity x Price per unit"
    )
    discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Line item discount"
    )
    cost_per_unit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Purchase cost per unit at time of sale (from batch.purchase_cost, for P&L calculation)"
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'transaction_item'
        verbose_name = 'Transaction Item'
        verbose_name_plural = 'Transaction Items'
        indexes = [
            models.Index(fields=['transaction'], name='idx_item_transaction'),
            models.Index(fields=['product'], name='idx_item_product'),
        ]
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

