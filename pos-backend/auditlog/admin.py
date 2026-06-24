from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'actor_name', 'actor_role', 'action', 'target_type', 'description')
    list_filter = ('action', 'actor_role', 'target_type', 'business')
    search_fields = ('description', 'actor_name')
    readonly_fields = ('business', 'actor', 'actor_name', 'actor_role', 'action',
                       'target_type', 'target_id', 'description', 'old_data',
                       'new_data', 'ip_address', 'created_at')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    def has_add_permission(self, request):
        return False  # Logs are system-generated only

    def has_change_permission(self, request, obj=None):
        return False  # Logs are immutable
