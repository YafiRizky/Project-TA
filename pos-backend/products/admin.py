from django.contrib import admin
from .models import Category, Supplier, Product


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'contact_person', 'phone', 'business', 'is_active', 'created_at']
    list_filter = ['business', 'is_active', 'city', 'created_at']
    search_fields = ['code', 'name', 'contact_person', 'email', 'address']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['business', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('business', 'code', 'name')
        }),
        ('Contact Information', {
            'fields': ('contact_person', 'phone', 'email', 'address', 'city')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'supplier', 'selling_price', 'business', 'is_active']
    list_filter = ['business', 'category', 'is_active', 'created_at']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'profit_margin']
    ordering = ['business', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('business', 'code', 'name', 'category', 'supplier', 'description')
        }),
        ('Pricing', {
            'fields': ('purchase_price', 'selling_price', 'profit_margin')
        }),
        ('Stock Information', {
            'fields': ('unit', 'min_stock')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'business', 'is_active', 'created_at']
    list_filter = ['business', 'is_active', 'created_at']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['business', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('business', 'code', 'name', 'description')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
