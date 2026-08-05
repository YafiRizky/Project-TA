from django.urls import path
from . import views
from . import xendit_views

app_name = 'payments'

urlpatterns = [
    # Payment Methods (existing)
    path('methods/', views.payment_method_list_create, name='method_list_create'),
    path('methods/<int:method_id>/', views.payment_method_detail, name='method_detail'),
    path('methods/<int:method_id>/toggle/', views.payment_method_toggle, name='method_toggle'),

    # Xendit Payment Gateway (redesigned)
    path('xendit/create-payment/', xendit_views.create_payment, name='xendit_create_payment'),
    path('xendit/check-status/<str:reference_id>/', xendit_views.check_status, name='xendit_check_status'),
    path('xendit/simulate/<str:reference_id>/', xendit_views.simulate, name='xendit_simulate'),
    path('xendit/webhook/', xendit_views.webhook, name='xendit_webhook'),
]
