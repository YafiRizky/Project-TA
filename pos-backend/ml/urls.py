from django.urls import path
from . import views

urlpatterns = [
    path('stockout/', views.stockout_prediction, name='ml-stockout'),
    path('restock/', views.restock_recommendation, name='ml-restock'),
    path('expiry-risk/', views.expiry_risk, name='ml-expiry-risk'),
    path('forecast/', views.revenue_forecast, name='ml-forecast'),
    path('classification/', views.product_classification, name='ml-classification'),
]
