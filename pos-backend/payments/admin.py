from django.contrib import admin
from .models import PaymentMethod


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('name', 'method_type', 'business', 'is_active', 'created_at')
    list_filter = ('method_type', 'is_active', 'business')
    search_fields = ('name', 'account_number', 'account_name')
    raw_id_fields = ('business',)
