from django.urls import path
from . import views

urlpatterns = [
    path('', views.discount_list_create, name='discount-list-create'),
    path('<int:pk>/', views.discount_detail, name='discount-detail'),
    path('active/', views.active_discounts, name='active-discounts'),
]
