from django.contrib import admin
from .models import Business, BusinessCodeHistory


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    """
    Django admin configuration for Business management
    Allows TechnicalAdmin to create/manage businesses
    """
    list_display = ('business_name', 'business_code', 'business_type', 'phone', 'is_active', 'created_at')
    list_filter = ('business_type', 'is_active', 'created_at')
    search_fields = ('business_name', 'business_code', 'phone', 'address')
    readonly_fields = ('business_code', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Business Information', {
            'fields': ('business_name', 'business_type', 'phone', 'address')
        }),
        ('System Info', {
            'fields': ('business_code', 'is_active'),
            'description': 'Business code is auto-generated and unique'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_businesses', 'deactivate_businesses']
    
    def activate_businesses(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} business(es) were activated.')
    activate_businesses.short_description = "Activate selected businesses"
    
    def deactivate_businesses(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} business(es) were deactivated.')
    deactivate_businesses.short_description = "Deactivate selected businesses"


@admin.register(BusinessCodeHistory)
class BusinessCodeHistoryAdmin(admin.ModelAdmin):
    """
    Django admin configuration for business code audit trail
    Read-only history of code changes
    """
    list_display = ('business', 'old_code', 'new_code', 'reason', 'changed_at')
    list_filter = ('changed_at',)
    search_fields = ('business__business_name', 'old_code', 'new_code', 'reason')
    readonly_fields = ('business', 'old_code', 'new_code', 'reason', 'changed_at')
    
    def has_add_permission(self, request):
        """Prevent manual creation, only via code rotation"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Read-only audit trail"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Preserve audit trail"""
        return False
