from rest_framework import serializers
from .models import Transaction, TransactionItem
from products.models import Product
from inventory.models import ProductBatch
from decimal import Decimal


class TransactionItemSerializer(serializers.ModelSerializer):
    """
    Transaction Item Serializer
    Individual line items in a transaction
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.code', read_only=True)
    batch_code = serializers.CharField(source='batch.batch_code', read_only=True, allow_null=True)
    
    class Meta:
        model = TransactionItem
        fields = [
            'id',
            'transaction',
            'product',
            'product_name',
            'product_code',
            'batch',
            'batch_code',
            'quantity',
            'price_per_unit',
            'cost_per_unit',
            'subtotal',
            'discount',
            'created_at'
        ]
        read_only_fields = ['id', 'transaction', 'product_name', 'product_code', 'batch_code', 'cost_per_unit', 'subtotal', 'created_at']
    
    def validate(self, data):
        """Validate quantity and prices"""
        quantity = data.get('quantity')
        price_per_unit = data.get('price_per_unit')
        
        if quantity <= 0:
            raise serializers.ValidationError({
                'quantity': "Quantity must be greater than 0"
            })
        
        if price_per_unit < 0:
            raise serializers.ValidationError({
                'price_per_unit': "Price cannot be negative"
            })
        
        return data


class TransactionSerializer(serializers.ModelSerializer):
    """
    Transaction Serializer for sales recording
    Includes nested transaction items
    """
    business_name = serializers.CharField(source='business.business_name', read_only=True)
    items = TransactionItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id',
            'business',
            'business_name',
            'transaction_code',
            'total_amount',
            'discount_amount',
            'payment_method',
            'amount_paid',
            'change_amount',
            'status',
            'notes',
            'cashier_name',
            'transaction_date',
            'item_count',
            'items',
            'created_at',
            'updated_at',
            'voided_at',
            'voided_by',
            'void_reason',
        ]
        read_only_fields = ['id', 'business', 'business_name', 'transaction_code', 'item_count', 'items', 'created_at', 'updated_at', 'voided_at', 'voided_by', 'void_reason']
    
    def get_item_count(self, obj):
        """Return total number of items"""
        return obj.item_count
    
    def validate(self, data):
        """Validate payment logic"""
        total_amount = data.get('total_amount')
        amount_paid = data.get('amount_paid')
        discount_amount = data.get('discount_amount', 0)
        
        # Validate amount paid >= total
        if amount_paid < total_amount:
            raise serializers.ValidationError({
                'amount_paid': f"Amount paid ({amount_paid}) must be >= total amount ({total_amount})"
            })
        
        # Validate discount structure
        if discount_amount and discount_amount > total_amount:
            raise serializers.ValidationError({
                'discount_amount': "Discount cannot exceed total amount"
            })
        
        # Auto-calculate change
        change = amount_paid - total_amount
        data['change_amount'] = change
        
        return data


class TransactionCreateSerializer(serializers.Serializer):
    """
    Simplified serializer for quick transaction creation (cart checkout)
    Used for POS transactions where we send items and calculate totals
    """
    items = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of {product_id, quantity, price_per_unit, discount?}"
    )
    discount_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        required=False
    )
    payment_method = serializers.ChoiceField(
        choices=('CASH', 'CARD', 'QRIS', 'TRANSFER', 'EWALLET', 'MIXED', 'XENDIT'),
        default='CASH'
    )
    amount_paid = serializers.DecimalField(
        max_digits=14,
        decimal_places=2
    )
    cashier_name = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True
    )
    
    def validate_items(self, value):
        """Validate items format and existence"""
        if not value or len(value) == 0:
            raise serializers.ValidationError("At least one item is required")
        
        for item in value:
            if 'product_id' not in item or 'quantity' not in item or 'price_per_unit' not in item:
                raise serializers.ValidationError("Each item must have product_id, quantity, and price_per_unit")
            
            if item['quantity'] <= 0:
                raise serializers.ValidationError("Item quantity must be > 0")
            
            # Verify product exists
            try:
                Product.objects.get(id=item['product_id'])
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product {item['product_id']} not found")
        
        return value
    
    def validate(self, data):
        """Validate transaction amounts"""
        items = data.get('items', [])
        discount_amount = data.get('discount_amount', Decimal('0.00'))
        amount_paid = data.get('amount_paid')
        
        # Calculate total
        total_before_discount = sum(
            Decimal(str(item.get('quantity', 0))) * Decimal(str(item.get('price_per_unit', 0)))
            for item in items
        )
        total_amount = total_before_discount - discount_amount
        
        # Validate amount paid
        if amount_paid < total_amount:
            raise serializers.ValidationError({
                'amount_paid': f"Amount paid ({amount_paid}) must be >= total ({total_amount})"
            })
        
        return data
