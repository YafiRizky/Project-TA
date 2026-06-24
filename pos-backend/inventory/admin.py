from django.contrib import admin
from .models import ProductBatch, InventoryMovement


@admin.register(ProductBatch)
class ProductBatchAdmin(admin.ModelAdmin):
    list_display = ['batch_code', 'product', 'quantity', 'purchase_date', 'expiry_date', 'status', 'business']
    list_filter = ['business', 'status', 'product', 'purchase_date', 'expiry_date']
    search_fields = ['batch_code', 'product__name', 'product__code']
    readonly_fields = ['created_at', 'updated_at', 'is_expired', 'days_until_expiry']
    ordering = ['purchase_date']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('business', 'product', 'batch_code')
        }),
        ('Quantities', {
            'fields': ('quantity', 'purchase_cost')
        }),
        ('Dates', {
            'fields': ('purchase_date', 'expiry_date', 'is_expired', 'days_until_expiry')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'movement_type', 'batch', 'quantity', 'reference_id', 'business']
    list_filter = ['business', 'movement_type', 'created_at']
    search_fields = ['batch__batch_code', 'batch__product__name', 'reference_id']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Movement Information', {
            'fields': ('business', 'batch', 'movement_type', 'quantity')
        }),
        ('Details', {
            'fields': ('notes', 'reference_id')
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

