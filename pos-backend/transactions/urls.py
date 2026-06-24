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
    path('', include(router.urls)),
]
