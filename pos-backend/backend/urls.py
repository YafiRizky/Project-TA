from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

def api_health(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'POS Backend API is running',
        'version': '1.0.0'
    })

urlpatterns = [
    # Root redirect to admin
    path('', RedirectView.as_view(url='/admin/', permanent=False), name='root'),
    
    # Django admin for TechnicalAdmin only
    path('admin/', admin.site.urls),
    
    # API endpoints for React frontend
    path('api/', api_health, name='api_health'),
    path('api/auth/', include('accounts.urls')),        # Authentication endpoints
    path('api/products/', include('products.urls')),    # Products endpoints (Categories, Suppliers, Products)
    path('api/inventory/', include('inventory.urls')),  # Inventory endpoints (Batches, Movements)
    path('api/transactions/', include('transactions.urls')),  # Transactions endpoints (Sales, POS)
    path('api/payments/', include('payments.urls')),    # Payment method configuration
    path('api/notifications/', include('notifications.urls')),  # Stock notifications
    path('api/auditlog/', include('auditlog.urls')),        # Audit trail / system history
    path('api/promotions/', include('promotions.urls')),# Diskon dan Promo
    path('api/ml/', include('ml.urls')),                # Machine Learning predictions
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
