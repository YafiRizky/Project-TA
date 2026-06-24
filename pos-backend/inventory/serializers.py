from rest_framework import serializers
from .models import ProductBatch, InventoryMovement, StockOpname, StockOpnameItem
from products.models import Product


class ProductBatchSerializer(serializers.ModelSerializer):
    """
    Product Batch Serializer for CRUD and inventory tracking
    Includes product info and expiry status
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.code', read_only=True)
    is_expired = serializers.SerializerMethodField(read_only=True)
    days_until_expiry = serializers.SerializerMethodField(read_only=True)
    business_name = serializers.CharField(source='business.business_name', read_only=True)
    
    class Meta:
        model = ProductBatch
        fields = [
            'id',
            'business',
            'business_name',
            'product',
            'product_name',
            'product_code',
            'batch_code',
            'quantity',
            'purchase_date',
            'expiry_date',
            'purchase_cost',
            'status',
            'is_expired',
            'days_until_expiry',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'business', 'business_name', 'product_name', 'product_code', 'is_expired', 'days_until_expiry', 'created_at', 'updated_at']
    
    def get_is_expired(self, obj):
        """Return expiry status"""
        return obj.is_expired
    
    def get_days_until_expiry(self, obj):
        """Return days until expiry"""
        return obj.days_until_expiry
    
    def validate(self, data):
        """Validate batch code uniqueness and dates"""
        request = self.context.get('request')
        product = data.get('product')
        batch_code = data.get('batch_code')
        expiry_date = data.get('expiry_date')
        purchase_date = data.get('purchase_date')
        
        # Validate date logic
        if expiry_date and purchase_date and expiry_date < purchase_date:
            raise serializers.ValidationError({
                'expiry_date': "Expiry date cannot be before purchase date"
            })
        
        # Validate unique batch code per product per business
        if request and hasattr(request.user, 'business'):
            business = request.user.business
            
            queryset = ProductBatch.objects.filter(
                business=business,
                product=product,
                batch_code=batch_code
            )
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError({
                    'batch_code': f"Batch code '{batch_code}' already exists for this product"
                })
        
        return data


class InventoryMovementSerializer(serializers.ModelSerializer):
    """
    Inventory Movement Serializer
    Audit trail for stock movements
    """
    batch_info = serializers.SerializerMethodField(read_only=True)
    product_name = serializers.CharField(source='batch.product.name', read_only=True)
    
    class Meta:
        model = InventoryMovement
        fields = [
            'id',
            'business',
            'batch',
            'batch_info',
            'product_name',
            'movement_type',
            'quantity',
            'notes',
            'reference_id',
            'created_at'
        ]
        read_only_fields = ['id', 'business', 'batch_info', 'product_name', 'created_at']
    
    def get_batch_info(self, obj):
        """Return batch code and product for display"""
        return {
            'batch_code': obj.batch.batch_code,
            'product_name': obj.batch.product.name,
            'quantity_remaining': obj.batch.quantity
        }

class StockOpnameItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='batch.product.name', read_only=True)
    product_code = serializers.CharField(source='batch.product.code', read_only=True)
    batch_code = serializers.CharField(source='batch.batch_code', read_only=True)
    expiry_date = serializers.DateField(source='batch.expiry_date', read_only=True)
    
    class Meta:
        model = StockOpnameItem
        fields = ['id', 'batch', 'product_name', 'product_code', 'batch_code', 'expiry_date',
                  'system_qty', 'actual_qty', 'difference']

class StockOpnameSerializer(serializers.ModelSerializer):
    items = StockOpnameItemSerializer(many=True)
    
    class Meta:
        model = StockOpname
        fields = ['id', 'document_number', 'created_by', 'approved_by', 'status', 'notes', 'created_at', 'updated_at', 'items']
        read_only_fields = ['id', 'document_number', 'created_by', 'approved_by', 'status', 'created_at', 'updated_at']
        
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        request = self.context.get('request')
        from django.utils import timezone
        
        business = request.user.business
        count = StockOpname.objects.filter(business=business).count() + 1
        date_str = timezone.now().strftime('%Y%m%d')
        document_number = f"SO-{date_str}-{count:04d}"
        
        opname = StockOpname.objects.create(
            business=business,
            document_number=document_number,
            created_by=request.user.username,
            **validated_data
        )
        
        for item_data in items_data:
            StockOpnameItem.objects.create(opname=opname, **item_data)
            
        return opname

