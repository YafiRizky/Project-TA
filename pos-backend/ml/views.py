"""
ML API Views V2 — 5 Endpoint Machine Learning + Caching
Semua endpoint require authentication dan business context.
Cache: 5 menit per business per endpoint.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache

from . import services

# Cache duration: 5 minutes
CACHE_TTL = 300


def get_business_id(request):
    """
    Extract business_id from authenticated user.
    Supports both admin (via header/query) and kasir (from user.business).
    """
    user = request.user

    # Check X-Business-Code header first (for admins switching businesses)
    biz_code = request.headers.get('X-Business-Code') or request.query_params.get('business_code')
    if biz_code:
        from businesses.models import Business
        try:
            biz = Business.objects.get(business_code=biz_code)
            # Verify admin owns this business
            if hasattr(user, 'owned_businesses') and user.owned_businesses.filter(id=biz.id).exists():
                return biz.id
            # Or kasir belongs to it
            if hasattr(user, 'business') and user.business_id == biz.id:
                return biz.id
        except Business.DoesNotExist:
            pass

    # Fallback: kasir's business
    if hasattr(user, 'business') and user.business_id:
        return user.business_id

    # Fallback: admin's first owned business
    if hasattr(user, 'owned_businesses'):
        first = user.owned_businesses.first()
        if first:
            return first.id

    return None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stockout_prediction(request):
    """
    GET /api/ml/stockout/
    Prediksi kapan stok produk akan habis (Moving Average + Confidence).
    """
    business_id = get_business_id(request)
    if not business_id:
        return Response({'error': 'Business context required'}, status=status.HTTP_400_BAD_REQUEST)

    cache_key = f'ml_stockout_{business_id}'
    cached = cache.get(cache_key)
    if cached:
        return Response(cached)

    try:
        data = services.predict_stockout(business_id)
        response_data = {
            'business_id': business_id,
            'total_products': len(data),
            'critical_count': len([d for d in data if d['risk_level'] == 'CRITICAL']),
            'high_count': len([d for d in data if d['risk_level'] == 'HIGH']),
            'medium_count': len([d for d in data if d['risk_level'] == 'MEDIUM']),
            'results': data,
        }
        cache.set(cache_key, response_data, CACHE_TTL)
        return Response(response_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def restock_recommendation(request):
    """
    GET /api/ml/restock/
    Rekomendasi restock berdasarkan Safety Stock (Z*sigma*sqrt(L)) + EOQ.
    Query params: lead_time (default=3 hari)
    """
    business_id = get_business_id(request)
    if not business_id:
        return Response({'error': 'Business context required'}, status=status.HTTP_400_BAD_REQUEST)

    lead_time = int(request.query_params.get('lead_time', 3))

    cache_key = f'ml_restock_{business_id}_{lead_time}'
    cached = cache.get(cache_key)
    if cached:
        return Response(cached)

    try:
        data = services.recommend_restock(business_id, lead_time_days=lead_time)
        needs_restock = [d for d in data if d['needs_restock']]
        total_cost = sum(d['estimated_cost'] for d in needs_restock)

        response_data = {
            'business_id': business_id,
            'lead_time_days': lead_time,
            'total_products': len(data),
            'needs_restock_count': len(needs_restock),
            'total_estimated_cost': round(total_cost, 2),
            'results': data,
        }
        cache.set(cache_key, response_data, CACHE_TTL)
        return Response(response_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def expiry_risk(request):
    """
    GET /api/ml/expiry-risk/
    Analisis risiko expired + sales velocity + rekomendasi aksi.
    """
    business_id = get_business_id(request)
    if not business_id:
        return Response({'error': 'Business context required'}, status=status.HTTP_400_BAD_REQUEST)

    cache_key = f'ml_expiry_{business_id}'
    cached = cache.get(cache_key)
    if cached:
        return Response(cached)

    try:
        data = services.analyze_expiry_risk(business_id)
        response_data = {
            'business_id': business_id,
            **data,
        }
        cache.set(cache_key, response_data, CACHE_TTL)
        return Response(response_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_forecast(request):
    """
    GET /api/ml/forecast/
    Prediksi revenue: Ridge Regression + StandardScaler + 12 Features.
    
    Query params:
      days (default=30): forecast days ahead (7, 30, 365)
      lookback (default=365): historical data lookback in days
    """
    business_id = get_business_id(request)
    if not business_id:
        return Response({'error': 'Business context required'}, status=status.HTTP_400_BAD_REQUEST)

    forecast_days = int(request.query_params.get('days', 30))
    lookback_days = int(request.query_params.get('lookback', 365))

    # "Semua" mode: days=0 means show all historical data, no future forecast
    if forecast_days == 0:
        lookback_days = 3650  # ~10 tahun, ambil semua data yang ada

    cache_key = f'ml_forecast_{business_id}_{forecast_days}_{lookback_days}'
    cached = cache.get(cache_key)
    if cached:
        return Response(cached)

    try:
        data = services.forecast_revenue(
            business_id,
            forecast_days=forecast_days,
            lookback_days=lookback_days,
        )
        response_data = {
            'business_id': business_id,
            'forecast_days': forecast_days,
            'lookback_days': lookback_days,
            **data,
        }
        cache.set(cache_key, response_data, CACHE_TTL)
        return Response(response_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_classification(request):
    """
    GET /api/ml/classification/
    Klasifikasi produk ABC (Pareto) + Profit + Trend.
    Query params: days (default=90)
    """
    business_id = get_business_id(request)
    if not business_id:
        return Response({'error': 'Business context required'}, status=status.HTTP_400_BAD_REQUEST)

    days = int(request.query_params.get('days', 90))

    cache_key = f'ml_classification_{business_id}_{days}'
    cached = cache.get(cache_key)
    if cached:
        return Response(cached)

    try:
        data = services.classify_products(business_id, days=days)
        response_data = {
            'business_id': business_id,
            'period_days': days,
            **data,
        }
        cache.set(cache_key, response_data, CACHE_TTL)
        return Response(response_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
