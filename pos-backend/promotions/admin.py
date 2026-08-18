from django.contrib import admin
from .models import DiscountRule


@admin.register(DiscountRule)
class DiscountRuleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'business', 'discount_type', 'discount_value', 'min_quantity', 'is_active', 'start_date', 'end_date', 'created_at')
    list_filter = ('discount_type', 'is_active', 'business')
    search_fields = ('name', 'business__business_name')
    filter_horizontal = ('products',)
    ordering = ('-created_at',)

