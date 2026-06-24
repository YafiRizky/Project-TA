"""
Audit Log Utility — Helper function to record audit events.
Call log_action() from any view to log an action.
"""
import logging
from .models import AuditLog

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Extract client IP from request headers."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def log_action(request, action, target_type, description, target_id=None, old_data=None, new_data=None, user=None):
    """
    Record an audit log entry.
    
    Args:
        request: Django request object
        action: One of AuditLog.ACTION_TYPES (CREATE, UPDATE, DELETE, etc.)
        target_type: String like 'Product', 'Category', 'Transaction'
        description: Human-readable description
        target_id: ID of the target object (optional)
        old_data: Dict of data before change (optional)
        new_data: Dict of data after change (optional)
        user: Optional user object (defaults to request.user)
    """
    try:
        user = user or request.user
        if not hasattr(user, 'business') or not user.business:
            return None
        
        log = AuditLog.objects.create(
            business=user.business,
            actor=user,
            actor_name=getattr(user, 'full_name', '') or getattr(user, 'username', 'Unknown'),
            actor_role=getattr(user, 'role', 'admin'),
            action=action,
            target_type=target_type,
            target_id=target_id,
            description=description,
            old_data=old_data,
            new_data=new_data,
            ip_address=get_client_ip(request),
        )
        return log
    except Exception as e:
        logger.error(f"Failed to create audit log: {e}")
        return None
