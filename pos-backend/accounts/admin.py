from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import TechnicalAdmin, BusinessUser


@admin.register(TechnicalAdmin)
class TechnicalAdminConfig(admin.ModelAdmin):
    """
    Django admin configuration for TechnicalAdmin
    Only accessible by other TechnicalAdmins
    """
    list_display = ('username', 'email', 'full_name', 'is_active', 'created_at', 'last_login')
    list_filter = ('is_active', 'created_at')
    search_fields = ('username', 'email', 'full_name')
    readonly_fields = ('created_at', 'last_login')
    
    fieldsets = (
        ('Authentication', {
            'fields': ('username', 'password')
        }),
        ('Personal Info', {
            'fields': ('email', 'full_name')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser'),
            'description': 'Technical administrators have full Django admin access'
        }),
        ('Important dates', {
            'fields': ('last_login', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Ensure password is properly hashed when saving"""
        if not change:  # Creating new user
            obj.set_password(form.cleaned_data.get('password'))
        super().save_model(request, obj, form, change)


@admin.register(BusinessUser)    
class BusinessUserAdmin(admin.ModelAdmin):
    """
    Django admin configuration for BusinessUser
    Allows TechnicalAdmin to view/manage business users
    """
    list_display = ('username', 'business', 'role', 'owner_code', 'full_name', 'email', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'business', 'created_at')
    search_fields = ('username', 'full_name', 'email', 'owner_code', 'business__business_name', 'business__business_code')
    readonly_fields = ('created_at', 'last_login')
    raw_id_fields = ('business',)
    
    fieldsets = (
        ('Business Association', {
            'fields': ('business',),
            'description': 'Business this user belongs to'
        }),
        ('Authentication', {
            'fields': ('username', 'password')
        }),
        ('Personal Info', {
            'fields': ('email', 'full_name', 'role', 'schedule', 'owner_code')
        }),
        ('Permissions', {
            'fields': ('is_active',),
            'description': 'Business users cannot access Django admin'
        }),
        ('Important dates', {
            'fields': ('last_login', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Include business information in queries for efficiency"""
        return super().get_queryset(request).select_related('business')
    
    def business_code(self, obj):
        """Display business code in admin list"""
        return obj.business.business_code
    business_code.short_description = 'Business Code'
    business_code.admin_order_field = 'business__business_code'
