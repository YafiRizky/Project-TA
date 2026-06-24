from django.contrib import admin
from .models import StockNotification

@admin.register(StockNotification)
class StockNotificationAdmin(admin.ModelAdmin):
    list_display = ('product', 'sender', 'notif_type', 'is_read', 'created_at')
    list_filter = ('notif_type', 'is_read', 'created_at')
    search_fields = ('product__name', 'sender__username')
