"""
URL routing for transactions app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'transactions'

# Router for ViewSets
router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet, basename='transaction')

urlpatterns = [
    path('transactions/export_data/', views.TransactionViewSet.as_view({'get': 'export_data'}), name='transaction-export-data-direct'),
    path('export_data/', views.TransactionViewSet.as_view({'get': 'export_data'}), name='export-data-alias'),
    path('', include(router.urls)),
]
