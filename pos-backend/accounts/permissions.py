"""
Role-based permission classes for BusinessUser
"""
from rest_framework.permissions import BasePermission


class IsBusinessAdmin(BasePermission):
    """
    Permission class that only allows business admin users.
    Kasir users will be denied access when this permission is applied.
    """
    message = 'Hanya admin yang dapat melakukan operasi ini.'

    def has_permission(self, request, view):
        return (
            hasattr(request.user, 'role')
            and request.user.role == 'admin'
        )
