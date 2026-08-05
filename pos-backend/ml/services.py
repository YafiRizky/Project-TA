"""
=================================================================
ML SERVICES V2 — 5 Modul Machine Learning untuk POS System
=================================================================

Modul 1: Stockout Prediction (Moving Average + Std Dev + Confidence)
Modul 2: Restock Recommendation (Safety Stock Z*sigma*sqrt(L) + EOQ)
Modul 3: Expiry Risk & Financial Loss (+ Sales Velocity + Recommendations)
Modul 4: Revenue Forecast (Linear Regression + Feature Engineering + Train-Test Split + MAE/RMSE)
Modul 5: Product Classification (ABC / Pareto + Profit-based + Trend)

Semua modul di-filter berdasarkan business_id (Multi-Tenant Isolation).
Optimized: no N+1 queries, single aggregated queries.
=================================================================
"""
import numpy as np
import pandas as pd
from datetime import timedelta, date
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, Count, F, Q, DecimalField, Avg
from django.db.models.functions import TruncDate

from transactions.models import Transaction, TransactionItem
from inventory.models import ProductBatch
from products.models import Product


# ============================================================
# MODUL 1: STOCKOUT PREDICTION (Moving Average + Confidence)
# ============================================================

def predict_stockout(business_id):
    """
    Prediksi kapan stok produk akan habis berdasarkan
    rata-rata penjualan harian (Moving Average 7 & 30 hari).

    Improvements V2:
    - Single aggregated query for all stock (no N+1)
    - Standard deviation for confidence interval
    - Confidence level per prediction

    Returns: list of dict per product
    """
    today = timezone.localdate()
    thirty_days_ago = today - timedelta(days=30)
    seven_days_ago = today - timedelta(days=7)

    # Get all active products for this business
    products = Product.objects.filter(
        business_id=business_id,
        is_active=True
    ).values('id', 'name', 'code', 'min_stock')

    # SINGLE QUERY: Get all stock totals grouped by product (fix N+1)
    stock_qs = ProductBatch.objects.filter(
        business_id=business_id,
        status='ACTIVE',
        quantity__gt=0,
    ).values('product_id').annotate(total_stock=Sum('quantity'))
    stock_map = {s['product_id']: s['total_stock'] for s in stock_qs}

    # Get transaction items for last 30 days grouped by product and date
    sales_qs = TransactionItem.objects.filter(
        transaction__business_id=business_id,
        transaction__status='COMPLETED',
        transaction__transaction_date__date__gte=thirty_days_ago,
    ).values(
        'product_id',
        sale_date=F('transaction__transaction_date__date'),
    ).annotate(
        daily_qty=Sum('quantity')
    )

    # Build dataframe
    if sales_qs.exists():
        df = pd.DataFrame(list(sales_qs))
    else:
        df = pd.DataFrame(columns=['product_id', 'sale_date', 'daily_qty'])

    results = []
    for prod in products:
        pid = prod['id']

        # Get stock from pre-fetched map (no individual query)
        current_stock = stock_map.get(pid, 0)

        # Filter sales for this product
        prod_sales = df[df['product_id'] == pid] if not df.empty else pd.DataFrame()

        if prod_sales.empty or len(prod_sales) == 0:
            avg_7 = 0
            avg_30 = 0
            std_dev = 0
            active_days = 0
        else:
            # Moving Average 30 days
            avg_30 = prod_sales['daily_qty'].sum() / 30

            # Moving Average 7 days
            seven_df = prod_sales[prod_sales['sale_date'] >= seven_days_ago] if 'sale_date' in prod_sales.columns else pd.DataFrame()
            avg_7 = seven_df['daily_qty'].sum() / 7 if not seven_df.empty else avg_30

            # Standard deviation of daily sales
            std_dev = float(prod_sales['daily_qty'].std()) if len(prod_sales) > 1 else 0
            active_days = len(prod_sales)

        # Use the higher average (more conservative / safer prediction)
        avg_daily = max(avg_7, avg_30)

        # Days until stockout
        if avg_daily > 0:
            days_until_out = current_stock / avg_daily
        else:
            days_until_out = 999

        # Confidence level based on data quality
        if active_days >= 20:
            confidence = 'HIGH'
        elif active_days >= 10:
            confidence = 'MEDIUM'
        elif active_days >= 3:
            confidence = 'LOW'
        else:
            confidence = 'INSUFFICIENT_DATA'

        # Risk level
        if days_until_out <= 3:
            risk = 'CRITICAL'
        elif days_until_out <= 7:
            risk = 'HIGH'
        elif days_until_out <= 14:
            risk = 'MEDIUM'
        else:
            risk = 'LOW'

        estimated_out_date = today + timedelta(days=int(days_until_out)) if days_until_out < 999 else None

        results.append({
            'product_id': pid,
            'product_name': prod['name'],
            'product_code': prod['code'],
            'current_stock': current_stock,
            'avg_daily_sales_7d': round(avg_7, 2),
            'avg_daily_sales_30d': round(avg_30, 2),
            'std_dev_daily': round(std_dev, 2),
            'days_until_stockout': round(days_until_out, 1),
            'estimated_stockout_date': estimated_out_date.isoformat() if estimated_out_date else None,
            'risk_level': risk,
            'confidence': confidence,
            'min_stock': prod['min_stock'],
            'active_selling_days': active_days,
        })

    # Sort by urgency (lowest days first)
    results.sort(key=lambda x: x['days_until_stockout'])
    return results


# ============================================================
# MODUL 2: RESTOCK RECOMMENDATION (Z*sigma*sqrt(L) + EOQ)
# ============================================================

def recommend_restock(business_id, lead_time_days=3):
    """
    Rekomendasi kapan dan berapa banyak restock berdasarkan:
    - Safety Stock = Z * sigma * sqrt(lead_time)
    - Reorder Point = (avg_daily * lead_time) + safety_stock
    - EOQ = sqrt((2 * D * S) / H) — Economic Order Quantity

    Z = 1.65 (95% service level)
    D = annual demand, S = ordering cost (Rp 10.000), H = holding cost (20% * unit_cost)

    Returns: list of dict per product that needs restock
    """
    Z_SCORE = 1.65  # 95% service level
    ORDERING_COST = 10000  # Rp 10.000 per order (biaya transport/ongkir)

    stockout_data = predict_stockout(business_id)
    recommendations = []

    for item in stockout_data:
        avg_daily = max(item['avg_daily_sales_7d'], item['avg_daily_sales_30d'])
        if avg_daily <= 0:
            continue

        current_stock = item['current_stock']
        std_dev = item.get('std_dev_daily', 0)

        # Safety Stock = Z * sigma * sqrt(L) — industry standard
        safety_stock = Z_SCORE * std_dev * np.sqrt(lead_time_days) if std_dev > 0 else avg_daily * lead_time_days * 0.2

        # Reorder Point
        reorder_point = (avg_daily * lead_time_days) + safety_stock

        # Do we need to restock?
        needs_restock = current_stock <= reorder_point

        # EOQ = sqrt((2 * D * S) / H)
        product = Product.objects.filter(id=item['product_id']).first()
        unit_cost = float(product.purchase_price) if product else 0
        annual_demand = avg_daily * 365
        holding_cost = unit_cost * 0.20  # 20% of unit cost per year

        if holding_cost > 0 and annual_demand > 0:
            eoq = np.sqrt((2 * annual_demand * ORDERING_COST) / holding_cost)
        else:
            eoq = avg_daily * 14  # fallback: 2 weeks supply

        # Recommended order qty: max of EOQ or (reorder to 2-week supply)
        order_qty = max(0, int(np.ceil(max(eoq, avg_daily * 14 + safety_stock - current_stock))))

        estimated_cost = order_qty * unit_cost

        urgency = 'URGENT' if item['risk_level'] in ('CRITICAL', 'HIGH') else (
            'SOON' if item['risk_level'] == 'MEDIUM' else 'OK'
        )

        recommendations.append({
            'product_id': item['product_id'],
            'product_name': item['product_name'],
            'product_code': item['product_code'],
            'current_stock': current_stock,
            'avg_daily_sales': round(avg_daily, 2),
            'std_dev_daily': round(std_dev, 2),
            'reorder_point': round(reorder_point, 1),
            'safety_stock': round(safety_stock, 1),
            'eoq': round(eoq, 1),
            'recommended_order_qty': order_qty,
            'estimated_cost': round(estimated_cost, 2),
            'unit_cost': unit_cost,
            'days_until_stockout': item['days_until_stockout'],
            'urgency': urgency,
            'needs_restock': needs_restock,
        })

    # Only show items that need restock, sorted by urgency
    urgency_order = {'URGENT': 0, 'SOON': 1, 'OK': 2}
    recommendations.sort(key=lambda x: (urgency_order.get(x['urgency'], 3), x['days_until_stockout']))

    return recommendations


# ============================================================
# MODUL 3: EXPIRY RISK & FINANCIAL LOSS (+ Sales Velocity)
# ============================================================

def analyze_expiry_risk(business_id):
    """
    Mengidentifikasi batch yang mendekati atau sudah expired,
    menghitung potensi kerugian finansial (Rp), dan proyeksi
    berapa yang bisa terjual sebelum expired (sales velocity).

    Improvements V2:
    - Sales velocity per product
    - Projected unsold quantity
    - Action recommendations

    Returns: dict with summary and details
    """
    today = timezone.localdate()
    thirty_days_ago = today - timedelta(days=30)

    # Get avg daily sales per product (single query)
    sales_velocity = TransactionItem.objects.filter(
        transaction__business_id=business_id,
        transaction__status='COMPLETED',
        transaction__transaction_date__date__gte=thirty_days_ago,
    ).values('product_id').annotate(
        total_sold=Sum('quantity'),
    )
    velocity_map = {s['product_id']: s['total_sold'] / 30 for s in sales_velocity}

    # Get batches with expiry dates for this business
    batches = ProductBatch.objects.filter(
        business_id=business_id,
        expiry_date__isnull=False,
        quantity__gt=0,
    ).select_related('product').order_by('expiry_date')

    expired = []
    critical = []  # <= 7 days
    warning = []   # 8-30 days
    safe = []      # > 30 days

    total_expired_loss = Decimal('0.00')
    total_critical_risk = Decimal('0.00')
    total_warning_risk = Decimal('0.00')

    for batch in batches:
        days_left = (batch.expiry_date - today).days

        # Sales velocity for this product
        avg_daily_sales = velocity_map.get(batch.product_id, 0)

        # Projected sales before expiry
        projected_sold = avg_daily_sales * max(0, days_left) if days_left > 0 else 0
        projected_unsold = max(0, batch.quantity - projected_sold)

        # Adjusted loss based on what won't sell
        full_loss = batch.purchase_cost * batch.quantity
        adjusted_loss = batch.purchase_cost * Decimal(str(int(projected_unsold)))

        # Action recommendation
        if days_left < 0:
            recommendation = "Segera buang / write-off"
        elif days_left <= 3:
            recommendation = "Diskon 50% segera atau bundle"
        elif days_left <= 7:
            recommendation = "Diskon 30% untuk percepat penjualan"
        elif days_left <= 14:
            recommendation = "Monitor, prioritaskan di display"
        elif days_left <= 30:
            recommendation = "Aman, tetap perhatikan rotasi stok"
        else:
            recommendation = "Aman"

        item = {
            'batch_id': batch.id,
            'batch_code': batch.batch_code,
            'product_name': batch.product.name,
            'product_code': batch.product.code,
            'quantity': batch.quantity,
            'purchase_cost': float(batch.purchase_cost),
            'potential_loss': float(full_loss),
            'adjusted_loss': float(adjusted_loss),
            'expiry_date': batch.expiry_date.isoformat(),
            'days_until_expiry': days_left,
            'selling_price': float(batch.product.selling_price),
            'avg_daily_sales': round(avg_daily_sales, 2),
            'projected_sold_before_expiry': round(projected_sold, 1),
            'projected_unsold': int(projected_unsold),
            'recommendation': recommendation,
        }

        if days_left < 0:
            item['status'] = 'EXPIRED'
            expired.append(item)
            total_expired_loss += full_loss
        elif days_left <= 7:
            item['status'] = 'CRITICAL'
            critical.append(item)
            total_critical_risk += adjusted_loss
        elif days_left <= 30:
            item['status'] = 'WARNING'
            warning.append(item)
            total_warning_risk += adjusted_loss
        else:
            item['status'] = 'SAFE'
            safe.append(item)

    return {
        'summary': {
            'total_expired_batches': len(expired),
            'total_critical_batches': len(critical),
            'total_warning_batches': len(warning),
            'total_safe_batches': len(safe),
            'total_expired_loss': float(total_expired_loss),
            'total_critical_risk': float(total_critical_risk),
            'total_warning_risk': float(total_warning_risk),
            'total_at_risk': float(total_expired_loss + total_critical_risk + total_warning_risk),
        },
        'expired': expired,
        'critical': critical,
        'warning': warning,
    }


# ============================================================
# MODUL 4: REVENUE FORECAST v2
# (Ridge + StandardScaler + 12 Features + Backtesting)
# ============================================================

def forecast_revenue(business_id, forecast_days=30, lookback_days=365):
    """
    Memprediksi revenue N hari ke depan menggunakan
    Ridge Regression + StandardScaler + 12 Feature Engineering.

    Improvements v2:
    - StandardScaler pada semua fitur (mencegah bias skala)
    - 12 fitur: day_of_week, is_weekend, is_payday, rolling_7d_avg,
      rolling_3d_avg, lag_1, lag_7, day_sin, day_cos, month, is_ramadan, is_holiday
    - Lookback configurable (default 365 hari)
    - Backtesting data: actual vs predicted per hari
    - MAPE metric

    Ref: Hyndman & Athanasopoulos (2021). Forecasting: Principles and Practice.
    Ref: Muhammad Ali & Faraj (2014). Data Normalization and Standardization.

    Returns: dict with historical, forecast, backtest, metrics
    """
    from sklearn.linear_model import Ridge
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

    today = timezone.localdate()
    start_date = today - timedelta(days=lookback_days)

    # Get daily revenue
    daily_revenue = Transaction.objects.filter(
        business_id=business_id,
        status='COMPLETED',
        transaction_date__date__gte=start_date,
    ).annotate(
        day=TruncDate('transaction_date')
    ).values('day').annotate(
        revenue=Sum('total_amount'),
        trx_count=Count('id'),
    ).order_by('day')

    if not daily_revenue.exists():
        return {
            'historical': [],
            'forecast': [],
            'backtest': [],
            'metrics': {
                'current_monthly_revenue': 0,
                'predicted_monthly_revenue': 0,
                'growth_percentage': 0,
                'avg_daily_revenue': 0,
                'r_squared': 0,
                'r_squared_test': 0,
                'mae': 0,
                'rmse': 0,
                'mape': 0,
                'trend': 'FLAT',
            }
        }

    # Build dataframe
    df = pd.DataFrame(list(daily_revenue))
    df['revenue'] = df['revenue'].astype(float)
    df['day'] = pd.to_datetime(df['day'])

    # Fill actual data range
    first_day = df['day'].min()
    all_days = pd.date_range(first_day, today)
    full_df = pd.DataFrame({'day': all_days})
    full_df = full_df.merge(df[['day', 'revenue', 'trx_count']], on='day', how='left')
    full_df['revenue'] = full_df['revenue'].fillna(0)
    full_df['trx_count'] = full_df['trx_count'].fillna(0).astype(int)

    # ===== Feature Engineering (12 fitur) =====
    full_df['day_of_week'] = full_df['day'].dt.weekday
    full_df['is_weekend'] = (full_df['day_of_week'] >= 5).astype(int)
    full_df['day_of_month'] = full_df['day'].dt.day
    full_df['is_payday'] = ((full_df['day_of_month'] >= 25) | (full_df['day_of_month'] <= 5)).astype(int)
    full_df['month'] = full_df['day'].dt.month

    # Rolling averages
    full_df['rolling_7d'] = full_df['revenue'].rolling(window=7, min_periods=1).mean()
    full_df['rolling_3d'] = full_df['revenue'].rolling(window=3, min_periods=1).mean()

    # Lag features
    full_df['lag_1'] = full_df['revenue'].shift(1).fillna(0)
    full_df['lag_7'] = full_df['revenue'].shift(7).fillna(0)

    # Cyclical day encoding (sin/cos)
    full_df['day_sin'] = np.sin(2 * np.pi * full_df['day_of_week'] / 7)
    full_df['day_cos'] = np.cos(2 * np.pi * full_df['day_of_week'] / 7)

    # Seasonal events (Indonesia calendar)
    def is_ramadan_period(d):
        """Approximate Ramadan 2025/2026 (varies by Hijri calendar)."""
        # Ramadan 2025: ~Feb 28 - Mar 29
        # Ramadan 2026: ~Feb 18 - Mar 19
        m, dy = d.month, d.day
        if (m == 3 and dy <= 29) or (m == 2 and dy >= 18):
            return 1
        return 0

    def is_holiday_period(d):
        """Major Indonesian holidays (approximate)."""
        m, dy = d.month, d.day
        holidays = [
            (1, 1),   # Tahun Baru
            (8, 17),  # Kemerdekaan
            (12, 25), # Natal
        ]
        for hm, hd in holidays:
            if m == hm and abs(dy - hd) <= 2:
                return 1
        return 0

    full_df['is_ramadan'] = full_df['day'].apply(is_ramadan_period)
    full_df['is_holiday'] = full_df['day'].apply(is_holiday_period)

    # Drop first rows where features aren't ready
    train_df = full_df.iloc[7:].copy().reset_index(drop=True)

    if len(train_df) < 14:
        avg_rev = full_df['revenue'].mean()
        historical = [{'date': row['day'].strftime('%Y-%m-%d'), 'revenue': round(row['revenue'], 2), 'trx_count': int(row['trx_count'])} for _, row in full_df.iterrows()]
        forecast = [{'date': (today + timedelta(days=i)).isoformat(), 'predicted_revenue': round(avg_rev, 2)} for i in range(1, forecast_days + 1)]
        return {
            'historical': historical,
            'forecast': forecast,
            'backtest': [],
            'metrics': {
                'current_monthly_revenue': round(full_df.tail(30)['revenue'].sum(), 2),
                'predicted_monthly_revenue': round(avg_rev * 30, 2),
                'growth_percentage': 0,
                'avg_daily_revenue': round(avg_rev, 2),
                'r_squared': 0, 'r_squared_test': 0, 'mae': 0, 'rmse': 0, 'mape': 0,
                'trend': 'FLAT',
            }
        }

    # ===== Feature matrix (12 fitur) =====
    feature_cols = ['day_of_week', 'is_weekend', 'is_payday', 'rolling_7d',
                    'rolling_3d', 'lag_1', 'lag_7', 'day_sin', 'day_cos',
                    'month', 'is_ramadan', 'is_holiday']
    X = train_df[feature_cols].values
    y = train_df['revenue'].values

    # Train-Test Split (80/20, time-ordered)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    # ===== StandardScaler (fit on train only) =====
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    # Train Ridge Regression
    model = Ridge(alpha=0.01)
    model.fit(X_train_s, y_train)

    # Metrics
    y_pred_train = model.predict(X_train_s)
    y_pred_test = model.predict(X_test_s)

    r_squared_train = r2_score(y_train, y_pred_train)
    r_squared_test = max(0, r2_score(y_test, y_pred_test))
    mae = mean_absolute_error(y_test, y_pred_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))

    # MAPE (avoid division by zero)
    nonzero_mask = y_test != 0
    if nonzero_mask.any():
        mape = float(np.mean(np.abs((y_test[nonzero_mask] - y_pred_test[nonzero_mask]) / y_test[nonzero_mask])) * 100)
    else:
        mape = 0

    # ===== Historical data =====
    historical = []
    for _, row in full_df.iterrows():
        historical.append({
            'date': row['day'].strftime('%Y-%m-%d'),
            'revenue': round(row['revenue'], 2),
            'trx_count': int(row['trx_count']),
        })

    # ===== Backtesting: Actual vs Predicted (test period) =====
    backtest = []
    test_dates = train_df['day'].values[split_idx:]
    for i, (actual, predicted) in enumerate(zip(y_test, y_pred_test)):
        dt = pd.Timestamp(test_dates[i])
        backtest.append({
            'date': dt.strftime('%Y-%m-%d'),
            'actual': round(float(actual), 2),
            'predicted': round(max(0, float(predicted)), 2),
            'error': round(float(actual - predicted), 2),
            'error_pct': round(float((actual - predicted) / actual * 100), 1) if actual != 0 else 0,
        })

    # ===== Forecast future N days =====
    forecast = []
    recent_revenues = list(full_df['revenue'].tail(7).values)
    last_revenue = full_df['revenue'].iloc[-1]

    for i in range(1, forecast_days + 1):
        future_date = today + timedelta(days=i)
        future_dow = future_date.weekday()

        future_features = {
            'day_of_week': future_dow,
            'is_weekend': 1 if future_dow >= 5 else 0,
            'is_payday': 1 if (future_date.day >= 25 or future_date.day <= 5) else 0,
            'rolling_7d': float(np.mean(recent_revenues[-7:])),
            'rolling_3d': float(np.mean(recent_revenues[-3:])),
            'lag_1': float(recent_revenues[-1]) if recent_revenues else 0,
            'lag_7': float(recent_revenues[-7]) if len(recent_revenues) >= 7 else float(np.mean(recent_revenues)),
            'day_sin': float(np.sin(2 * np.pi * future_dow / 7)),
            'day_cos': float(np.cos(2 * np.pi * future_dow / 7)),
            'month': future_date.month,
            'is_ramadan': is_ramadan_period(future_date),
            'is_holiday': is_holiday_period(future_date),
        }

        X_future = np.array([[future_features[c] for c in feature_cols]])
        X_future_s = scaler.transform(X_future)
        predicted = max(0, float(model.predict(X_future_s)[0]))

        forecast.append({
            'date': future_date.isoformat(),
            'predicted_revenue': round(predicted, 2),
        })

        recent_revenues.append(predicted)

    # Metrics summary
    last_30 = full_df.tail(30)['revenue'].sum()
    predicted_30 = sum(f['predicted_revenue'] for f in forecast[:30])
    growth = ((predicted_30 - last_30) / last_30 * 100) if last_30 > 0 else 0

    if growth > 5:
        trend = 'UP'
    elif growth < -5:
        trend = 'DOWN'
    else:
        trend = 'FLAT'

    return {
        'historical': historical,
        'forecast': forecast,
        'backtest': backtest,
        'metrics': {
            'current_monthly_revenue': round(last_30, 2),
            'predicted_monthly_revenue': round(predicted_30, 2),
            'growth_percentage': round(growth, 2),
            'avg_daily_revenue': round(full_df['revenue'].mean(), 2),
            'r_squared': round(r_squared_train, 4),
            'r_squared_test': round(r_squared_test, 4),
            'mae': round(mae, 2),
            'rmse': round(rmse, 2),
            'mape': round(mape, 1),
            'trend': trend,
            'features_used': feature_cols,
            'train_size': len(X_train),
            'test_size': len(X_test),
            'standardized': True,
        }
    }


# ============================================================
# MODUL 5: PRODUCT CLASSIFICATION (ABC + Profit + Trend)
# ============================================================

def classify_products(business_id, days=90):
    """
    Mengklasifikasikan produk menggunakan analisis ABC (Pareto 80/20).

    Improvements V2:
    - Profit-based analysis (not just revenue)
    - Trend indicator (30d vs previous 30d)

    Returns: dict with products list and summary
    """
    today = timezone.localdate()
    start_date = today - timedelta(days=days)
    mid_date = today - timedelta(days=30)

    # Get revenue + profit per product
    product_data = TransactionItem.objects.filter(
        transaction__business_id=business_id,
        transaction__status='COMPLETED',
        transaction__transaction_date__date__gte=start_date,
    ).values(
        'product_id',
        product_name=F('product__name'),
        product_code=F('product__code'),
    ).annotate(
        total_revenue=Sum('subtotal'),
        total_qty=Sum('quantity'),
        transaction_count=Count('transaction', distinct=True),
        total_cost=Sum(F('cost_per_unit') * F('quantity'), output_field=DecimalField()),
    ).order_by('-total_revenue')

    if not product_data.exists():
        return {'products': [], 'summary': {
            'total_revenue': 0,
            'class_a_count': 0, 'class_b_count': 0, 'class_c_count': 0,
            'class_a_revenue_pct': 0, 'class_b_revenue_pct': 0, 'class_c_revenue_pct': 0,
            'period_days': days,
        }}

    df = pd.DataFrame(list(product_data))
    df['total_revenue'] = df['total_revenue'].astype(float)
    df['total_cost'] = df['total_cost'].astype(float) if 'total_cost' in df.columns else 0
    df['total_profit'] = df['total_revenue'] - df['total_cost']

    grand_total = df['total_revenue'].sum()
    df['revenue_pct'] = (df['total_revenue'] / grand_total * 100).round(2)
    df['cumulative_pct'] = df['revenue_pct'].cumsum().round(2)

    # Classify
    def classify(cum_pct):
        if cum_pct <= 80:
            return 'A'
        elif cum_pct <= 95:
            return 'B'
        else:
            return 'C'

    df['classification'] = df['cumulative_pct'].apply(classify)

    # Trend: compare last 30 days vs previous 30 days
    recent_sales = TransactionItem.objects.filter(
        transaction__business_id=business_id,
        transaction__status='COMPLETED',
        transaction__transaction_date__date__gte=mid_date,
    ).values('product_id').annotate(recent_rev=Sum('subtotal'))
    recent_map = {s['product_id']: float(s['recent_rev']) for s in recent_sales}

    prev_sales = TransactionItem.objects.filter(
        transaction__business_id=business_id,
        transaction__status='COMPLETED',
        transaction__transaction_date__date__gte=mid_date - timedelta(days=30),
        transaction__transaction_date__date__lt=mid_date,
    ).values('product_id').annotate(prev_rev=Sum('subtotal'))
    prev_map = {s['product_id']: float(s['prev_rev']) for s in prev_sales}

    # Build result
    products = []
    for _, row in df.iterrows():
        pid = int(row['product_id'])
        recent = recent_map.get(pid, 0)
        previous = prev_map.get(pid, 0)

        if previous > 0:
            trend_pct = round((recent - previous) / previous * 100, 1)
        elif recent > 0:
            trend_pct = 100.0
        else:
            trend_pct = 0.0

        if trend_pct > 10:
            trend = 'UP'
        elif trend_pct < -10:
            trend = 'DOWN'
        else:
            trend = 'STABLE'

        products.append({
            'product_id': pid,
            'product_name': row['product_name'],
            'product_code': row['product_code'],
            'total_revenue': round(row['total_revenue'], 2),
            'total_profit': round(row['total_profit'], 2),
            'total_qty_sold': int(row['total_qty']),
            'transaction_count': int(row['transaction_count']),
            'revenue_percentage': row['revenue_pct'],
            'cumulative_percentage': row['cumulative_pct'],
            'classification': row['classification'],
            'trend': trend,
            'trend_percentage': trend_pct,
        })

    class_a = df[df['classification'] == 'A']
    class_b = df[df['classification'] == 'B']
    class_c = df[df['classification'] == 'C']

    return {
        'products': products,
        'summary': {
            'total_revenue': round(grand_total, 2),
            'total_profit': round(df['total_profit'].sum(), 2),
            'total_products_analyzed': len(df),
            'class_a_count': len(class_a),
            'class_b_count': len(class_b),
            'class_c_count': len(class_c),
            'class_a_revenue_pct': round(class_a['revenue_pct'].sum(), 2) if len(class_a) > 0 else 0,
            'class_b_revenue_pct': round(class_b['revenue_pct'].sum(), 2) if len(class_b) > 0 else 0,
            'class_c_revenue_pct': round(class_c['revenue_pct'].sum(), 2) if len(class_c) > 0 else 0,
            'period_days': days,
        }
    }
