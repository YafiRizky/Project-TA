"""
URL routing for products app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'products'

# Router for ViewSets
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'suppliers', views.SupplierViewSet, basename='supplier')
router.register(r'products', views.ProductViewSet, basename='product')

urlpatterns = [
    path('generate-code/', views.generate_code_preview, name='generate_code_preview'),
    path('', include(router.urls)),
]
