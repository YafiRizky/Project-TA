from django.contrib import admin
from .models import PaymentMethod
from .xendit_models import XenditPayment


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('name', 'method_type', 'business', 'is_active', 'use_xendit', 'xendit_channel', 'created_at')
    list_filter = ('method_type', 'is_active', 'use_xendit', 'business')
    search_fields = ('name', 'account_number', 'account_name')
    raw_id_fields = ('business',)


@admin.register(XenditPayment)
class XenditPaymentAdmin(admin.ModelAdmin):
    list_display = ('reference_id', 'payment_type', 'amount', 'status', 'business', 'created_at')
    list_filter = ('payment_type', 'status', 'business')
    search_fields = ('reference_id', 'xendit_id', 'va_number')
    raw_id_fields = ('business',)
    readonly_fields = ('created_at', 'updated_at')
