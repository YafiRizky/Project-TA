import random
import string
from rest_framework import serializers
from django.db.models import Sum
from .models import Category, Supplier, Product
from businesses.models import Business


def generate_code(name, model_class, business):
    """
    Auto-generate a unique code for Product, Category, or Supplier.
    
    PREFIX rules based on word count in name:
    - 1 word: first 3 uppercase letters (e.g. 'Aqua' -> 'AQU')
    - 2 words: first letter of each word uppercase (e.g. 'Mie Goreng' -> 'MG')
    - 3 words: first letter of each word uppercase (e.g. 'Nasi Goreng Spesial' -> 'NGS')
    - 4+ words: first letter of first 3 words uppercase (e.g. 'Susu Ultra Milk Coklat' -> 'SUM')
    
    SUFFIX: 5-character random alphanumeric (uppercase + digits)
    
    Format: PREFIX-SUFFIX (e.g. 'MG-X9K2A')
    Ensures uniqueness within the given business.
    """
    # Clean and split the name
    words = name.strip().split()
    
    if len(words) == 0:
        prefix = 'XXX'
    elif len(words) == 1:
        # First 3 uppercase letters
        prefix = words[0][:3].upper()
    elif len(words) == 2:
        # First letter of each word
        prefix = ''.join(w[0] for w in words).upper()
    elif len(words) == 3:
        # First letter of each word
        prefix = ''.join(w[0] for w in words).upper()
    else:
        # 4+ words: first letter of first 3 words
        prefix = ''.join(w[0] for w in words[:3]).upper()
    
    # Generate unique code with random suffix
    characters = string.ascii_uppercase + string.digits
    max_attempts = 100
    
    for _ in range(max_attempts):
        suffix = ''.join(random.choice(characters) for _ in range(5))
        code = f"{prefix}-{suffix}"
        
        if not model_class.objects.filter(business=business, code=code).exists():
            return code
    
    # Fallback: should never reach here in practice
    raise ValueError("Could not generate a unique code after maximum attempts")


class SupplierSerializer(serializers.ModelSerializer):
    """
    Supplier Serializer for CRUD operations
    Auto-assigns business from authenticated user
    """
    business_name = serializers.CharField(source='business.business_name', read_only=True)
    code = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Supplier
        fields = [
            'id',
            'business',
            'business_name',
            'code',
            'name',
            'contact_person',
            'phone',
            'email',
            'address',
            'city',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'business', 'business_name', 'created_at', 'updated_at']
    
    def validate_code(self, value):
        """Validate code is uppercase and alphanumeric"""
        if not value:
            return value
        if not value.isupper():
            raise serializers.ValidationError("Code must be uppercase")
        if not value.replace('_', '').replace('-', '').isalnum():
            raise serializers.ValidationError("Code must be alphanumeric (underscores and hyphens allowed)")
        return value
    
    def validate(self, data):
        """Validate unique code per business"""
        request = self.context.get('request')
        if request and hasattr(request.user, 'business'):
            business = request.user.business
            code = data.get('code')
            
            # Skip uniqueness check if code is empty (will be auto-generated in create)
            if not code:
                return data
            
            queryset = Supplier.objects.filter(business=business, code=code)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError({
                    'code': f"Supplier with code '{code}' already exists in your business"
                })
        
        return data
    
    def create(self, validated_data):
        """Auto-generate code if not provided"""
        code = validated_data.get('code', '')
        if not code:
            business = validated_data.get('business')
            name = validated_data.get('name', '')
            validated_data['code'] = generate_code(name, Supplier, business)
        return super().create(validated_data)


class ProductSerializer(serializers.ModelSerializer):
    """
    Product Serializer for CRUD operations
    Auto-assigns business from authenticated user
    Includes related category and supplier info
    """
    business_name = serializers.CharField(source='business.business_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    profit_margin = serializers.SerializerMethodField(read_only=True)
    current_stock = serializers.SerializerMethodField(read_only=True)
    code = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Product
        fields = [
            'id',
            'business',
            'business_name',
            'category',
            'category_name',
            'supplier',
            'supplier_name',
            'code',
            'barcode',
            'name',
            'description',
            'purchase_price',
            'selling_price',
            'profit_margin',
            'current_stock',
            'unit',
            'min_stock',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'business', 'business_name', 'category_name', 'supplier_name', 'profit_margin', 'current_stock', 'created_at', 'updated_at']
    
    def get_profit_margin(self, obj):
        """Calculate and return profit margin"""
        return obj.profit_margin
    
    def get_current_stock(self, obj):
        """Calculate total active stock from all ProductBatch entries for this product"""
        from inventory.models import ProductBatch
        total = ProductBatch.objects.filter(
            product=obj,
            business=obj.business,
            status='ACTIVE'
        ).aggregate(total=Sum('quantity'))['total']
        return total or 0
    
    def validate_code(self, value):
        """Validate code is alphanumeric or barcode format"""
        if not value:
            return value
        if not value.replace('-', '').replace('_', '').isalnum():
            raise serializers.ValidationError("Code must be alphanumeric (underscores and hyphens allowed)")
        return value
    
    def validate(self, data):
        """Validate prices and unique code per business"""
        request = self.context.get('request')
        
        # Validate prices
        purchase_price = data.get('purchase_price', 0)
        selling_price = data.get('selling_price', 0)
        
        if selling_price < purchase_price:
            raise serializers.ValidationError({
                'selling_price': "Selling price cannot be less than purchase price"
            })
        
        # Validate unique code per business
        if request and hasattr(request.user, 'business'):
            business = request.user.business
            code = data.get('code')
            
            # Skip uniqueness check if code is empty (will be auto-generated in create)
            if not code:
                return data
            
            queryset = Product.objects.filter(business=business, code=code)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError({
                    'code': f"Product with code '{code}' already exists in your business"
                })
        
        return data
    
    def create(self, validated_data):
        """Auto-generate code if not provided"""
        code = validated_data.get('code', '')
        if not code:
            business = validated_data.get('business')
            name = validated_data.get('name', '')
            validated_data['code'] = generate_code(name, Product, business)
        return super().create(validated_data)


class CategorySerializer(serializers.ModelSerializer):
    """
    Category Serializer for CRUD operations
    Auto-assigns business from authenticated user
    """
    business_name = serializers.CharField(source='business.business_name', read_only=True)
    code = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Category
        fields = [
            'id',
            'business',
            'business_name',
            'code',
            'name',
            'description',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'business', 'business_name', 'created_at', 'updated_at']
    
    def validate_code(self, value):
        """Validate code is uppercase and alphanumeric"""
        if not value:
            return value
        if not value.isupper():
            raise serializers.ValidationError("Code must be uppercase")
        if not value.replace('_', '').replace('-', '').isalnum():
            raise serializers.ValidationError("Code must be alphanumeric (underscores and hyphens allowed)")
        return value
    
    def validate(self, data):
        """Validate unique code per business"""
        request = self.context.get('request')
        if request and hasattr(request.user, 'business'):
            business = request.user.business
            code = data.get('code')
            
            # Skip uniqueness check if code is empty (will be auto-generated in create)
            if not code:
                return data
            
            # Check for duplicate code in same business (exclude current instance when updating)
            queryset = Category.objects.filter(business=business, code=code)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError({
                    'code': f"Category with code '{code}' already exists in your business"
                })
        
        return data
    
    def create(self, validated_data):
        """Auto-generate code if not provided"""
        code = validated_data.get('code', '')
        if not code:
            business = validated_data.get('business')
            name = validated_data.get('name', '')
            validated_data['code'] = generate_code(name, Category, business)
        return super().create(validated_data)
