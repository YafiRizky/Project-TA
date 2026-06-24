"""
URL routing for inventory app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'inventory'

# Router for ViewSets
router = DefaultRouter()
router.register(r'batches', views.ProductBatchViewSet, basename='batch')
router.register(r'movements', views.InventoryMovementViewSet, basename='movement')
router.register(r'opname', views.StockOpnameViewSet, basename='opname')

urlpatterns = [
    path('', include(router.urls)),
]
