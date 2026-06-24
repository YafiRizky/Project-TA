from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.notification_list, name='notification_list'),
    path('create/', views.notification_create, name='notification_create'),
    path('<int:notif_id>/read/', views.notification_mark_read, name='notification_mark_read'),
    path('read-all/', views.notification_mark_all_read, name='notification_mark_all_read'),
]
