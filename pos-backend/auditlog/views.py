"""
Audit Log Views — List and filter audit log entries.
Admin-only access.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.dateparse import parse_date

from .models import AuditLog


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_log_list(request):
    """
    GET: List audit logs for the current business.
    Admin-only. Supports filtering by action, actor, target_type, date range.
    Pagination via limit/offset.
    """
    # Admin only
    if not hasattr(request.user, 'role') or request.user.role != 'admin':
        return Response(
            {'error': 'Hanya admin yang dapat melihat audit log'},
            status=status.HTTP_403_FORBIDDEN
        )

    business = request.user.business
    logs = AuditLog.objects.filter(business=business)

    # Filters
    action = request.query_params.get('action')
    if action:
        logs = logs.filter(action=action)

    actor_id = request.query_params.get('actor_id')
    if actor_id:
        logs = logs.filter(actor_id=actor_id)

    target_type = request.query_params.get('target_type')
    if target_type:
        logs = logs.filter(target_type=target_type)

    date_from = request.query_params.get('date_from')
    if date_from:
        parsed = parse_date(date_from)
        if parsed:
            logs = logs.filter(created_at__date__gte=parsed)

    date_to = request.query_params.get('date_to')
    if date_to:
        parsed = parse_date(date_to)
        if parsed:
            logs = logs.filter(created_at__date__lte=parsed)

    # Search in description
    search = request.query_params.get('search')
    if search:
        logs = logs.filter(description__icontains=search)

    # Pagination
    total = logs.count()
    limit = min(int(request.query_params.get('limit', 50)), 200)
    offset = int(request.query_params.get('offset', 0))
    logs = logs[offset:offset + limit]

    data = []
    for log in logs:
        data.append({
            'id': log.id,
            'actor_name': log.actor_name,
            'actor_role': log.actor_role,
            'actor_id': log.actor_id,
            'action': log.action,
            'action_display': log.get_action_display(),
            'target_type': log.target_type,
            'target_id': log.target_id,
            'description': log.description,
            'old_data': log.old_data,
            'new_data': log.new_data,
            'ip_address': log.ip_address,
            'created_at': log.created_at.isoformat(),
        })

    return Response({
        'logs': data,
        'total': total,
        'limit': limit,
        'offset': offset,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_log_filters(request):
    """
    GET: Return available filter options (action types, actors, target types).
    Used by frontend to populate filter dropdowns.
    """
    if not hasattr(request.user, 'role') or request.user.role != 'admin':
        return Response(
            {'error': 'Hanya admin yang dapat melihat audit log'},
            status=status.HTTP_403_FORBIDDEN
        )

    business = request.user.business

    # Get distinct values
    actions = list(AuditLog.objects.filter(business=business)
                   .values_list('action', flat=True).distinct())
    
    actors = list(AuditLog.objects.filter(business=business)
                  .values('actor_id', 'actor_name', 'actor_role')
                  .distinct()[:50])
    
    target_types = list(AuditLog.objects.filter(business=business)
                        .values_list('target_type', flat=True).distinct())

    action_choices = dict(AuditLog.ACTION_TYPES)

    return Response({
        'actions': [{'value': a, 'label': action_choices.get(a, a)} for a in actions],
        'actors': actors,
        'target_types': target_types,
    })
