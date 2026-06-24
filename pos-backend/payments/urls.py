from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('methods/', views.payment_method_list_create, name='method_list_create'),
    path('methods/<int:method_id>/', views.payment_method_detail, name='method_detail'),
    path('methods/<int:method_id>/toggle/', views.payment_method_toggle, name='method_toggle'),
]
