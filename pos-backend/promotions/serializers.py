from rest_framework import serializers
from .models import DiscountRule
from products.models import Product

class ProductSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'code', 'selling_price']

class DiscountRuleSerializer(serializers.ModelSerializer):
    products = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        many=True,
        required=False
    )
    products_detail = ProductSimpleSerializer(source='products', many=True, read_only=True)
    discount_type_display = serializers.CharField(source='get_discount_type_display', read_only=True)

    class Meta:
        model = DiscountRule
        fields = [
            'id', 'name', 'discount_type', 'discount_type_display', 'discount_value', 
            'min_quantity', 'products', 'products_detail', 'is_active', 
            'start_date', 'end_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_discount_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Nilai diskon harus lebih dari 0")
        return value

    def validate_min_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Minimal kuantitas harus >= 1")
        return value

    def validate(self, data):
        # Additional validations could be added here
        discount_type = data.get('discount_type', getattr(self.instance, 'discount_type', None))
        discount_value = data.get('discount_value', getattr(self.instance, 'discount_value', None))
        
        if discount_type == 'PERCENTAGE' and discount_value > 100:
            raise serializers.ValidationError({
                'discount_value': "Persentase diskon tidak boleh lebih dari 100%"
            })
            
        return data
