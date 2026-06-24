from django.contrib import admin
from .models import Transaction, TransactionItem


class TransactionItemInline(admin.TabularInline):
    """Inline admin for transaction items"""
    model = TransactionItem
    extra = 0
    readonly_fields = ['created_at', 'product', 'quantity', 'price_per_unit', 'subtotal']
    fields = ['product', 'quantity', 'price_per_unit', 'subtotal', 'discount']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_code', 'total_amount', 'payment_method', 'status', 'transaction_date', 'cashier_name', 'business']
    list_filter = ['business', 'status', 'payment_method', 'transaction_date']
    search_fields = ['transaction_code', 'cashier_name']
    readonly_fields = ['created_at', 'updated_at', 'item_count']
    ordering = ['-transaction_date']
    inlines = [TransactionItemInline]
    
    fieldsets = (
        ('Transaction Information', {
            'fields': ('business', 'transaction_code', 'transaction_date', 'cashier_name')
        }),
        ('Amounts', {
            'fields': ('total_amount', 'discount_amount', 'item_count')
        }),
        ('Payment', {
            'fields': ('payment_method', 'amount_paid', 'change_amount')
        }),
        ('Status & Notes', {
            'fields': ('status', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TransactionItem)
class TransactionItemAdmin(admin.ModelAdmin):
    list_display = ['transaction', 'product', 'quantity', 'price_per_unit', 'subtotal', 'discount']
    list_filter = ['transaction__transaction_date', 'product']
    search_fields = ['transaction__transaction_code', 'product__name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Item Information', {
            'fields': ('transaction', 'product', 'batch')
        }),
        ('Quantities & Pricing', {
            'fields': ('quantity', 'price_per_unit', 'subtotal', 'discount')
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

