"""
URL routing for accounts app - authentication endpoints
"""
from django.urls import path

from . import views
from .token_views import BusinessTokenRefreshView

app_name = 'accounts'

urlpatterns = [
    # Business user authentication endpoints
    path('login/', views.business_login, name='business_login'),
    path('register/', views.register_business, name='register_business'),
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/business/', views.business_profile, name='business_profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('logout/', views.logout, name='logout'),
    
    # JWT token endpoints  
    path('token/', views.BusinessTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', BusinessTokenRefreshView.as_view(), name='token_refresh'),
    path('refresh/', BusinessTokenRefreshView.as_view(), name='token_refresh_alt'),
    
    # Branch management (Admin only)
    path('me/businesses/', views.my_businesses, name='my_businesses'),
    path('switch-branch/', views.switch_branch, name='switch_branch'),
    path('create-branch/', views.create_branch, name='create_branch'),
    
    # Kasir management endpoints (admin only)
    path('kasir/', views.kasir_list_create, name='kasir_list_create'),
    path('kasir/<int:kasir_id>/', views.kasir_detail, name='kasir_detail'),
    path('kasir/<int:kasir_id>/toggle/', views.kasir_toggle_status, name='kasir_toggle'),
    path('kasir/<int:kasir_id>/reset-password/', views.kasir_reset_password, name='kasir_reset_password'),
]