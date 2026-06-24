from django.urls import path
from . import views

urlpatterns = [
    path('', views.audit_log_list, name='audit-log-list'),
    path('filters/', views.audit_log_filters, name='audit-log-filters'),
]
