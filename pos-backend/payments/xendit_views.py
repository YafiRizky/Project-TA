"""
Xendit views — endpoint untuk pembayaran digital terintegrasi.
1. POST /api/payments/xendit/create-payment/   — Buat pembayaran (QRIS/VA/eWallet)
2. GET  /api/payments/xendit/check-status/<ref>/ — Cek status pembayaran
3. POST /api/payments/xendit/simulate/<ref>/     — Simulasi pembayaran (test mode)
4. POST /api/payments/xendit/webhook/            — Webhook dari Xendit
"""
import logging
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import PaymentMethod
from .xendit_models import XenditPayment
from .xendit_service import (
    create_qris_payment,
    create_va_payment,
    create_ewallet_charge,
    check_payment_status,
    simulate_payment,
)

logger = logging.getLogger(__name__)


def get_business(user):
    """Helper: get business dari user (admin atau kasir)."""
    if hasattr(user, 'business') and user.business:
        return user.business
    if hasattr(user, 'owned_businesses'):
        return user.owned_businesses.first()
    return None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """
    POST /api/payments/xendit/create-payment/
    Body: { payment_method_id, amount }
    
    Deteksi tipe pembayaran dari PaymentMethod, lalu panggil service Xendit yang sesuai.
    Returns data yang dibutuhkan frontend untuk menampilkan QR/VA/URL.
    """
    business = get_business(request.user)
    if not business:
        return Response({'error': 'Business tidak ditemukan'}, status=status.HTTP_400_BAD_REQUEST)

    payment_method_id = request.data.get('payment_method_id')
    amount = request.data.get('amount')

    if not payment_method_id or not amount:
        return Response({'error': 'payment_method_id dan amount wajib diisi'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        amount = float(amount)
        if amount < 1000:
            return Response({'error': 'Minimum pembayaran Xendit adalah Rp 1.000'}, status=status.HTTP_400_BAD_REQUEST)
    except (ValueError, TypeError):
        return Response({'error': 'amount harus berupa angka positif'}, status=status.HTTP_400_BAD_REQUEST)

    # Get payment method
    try:
        pm = PaymentMethod.objects.get(id=payment_method_id, business=business, is_active=True)
    except PaymentMethod.DoesNotExist:
        return Response({'error': 'Metode pembayaran tidak ditemukan'}, status=status.HTTP_404_NOT_FOUND)

    if not pm.use_xendit:
        return Response({'error': 'Metode pembayaran ini tidak menggunakan Xendit'}, status=status.HTTP_400_BAD_REQUEST)

    # Route berdasarkan method_type
    if pm.method_type == 'QRIS':
        result = create_qris_payment(business, amount)
        payment_type = 'QRIS'
    elif pm.method_type == 'TRANSFER':
        bank_code = pm.xendit_channel or 'BCA'
        result = create_va_payment(business, amount, bank_code)
        payment_type = 'VA'
    elif pm.method_type == 'EWALLET':
        channel_code = pm.xendit_channel or 'ID_DANA'
        result = create_ewallet_charge(business, amount, channel_code)
        payment_type = 'EWALLET'
    else:
        return Response({'error': f'Tipe pembayaran {pm.method_type} tidak didukung oleh Xendit'}, status=status.HTTP_400_BAD_REQUEST)

    if not result.get('success'):
        return Response({'error': result.get('error', 'Gagal membuat pembayaran')}, status=status.HTTP_502_BAD_GATEWAY)

    # Simpan ke database
    payment = XenditPayment.objects.create(
        business=business,
        reference_id=result['reference_id'],
        xendit_id=result.get('xendit_id', ''),
        payment_type=payment_type,
        amount=amount,
        status='PENDING',
        qr_string=result.get('qr_string', ''),
        va_number=result.get('va_number', ''),
        bank_code=result.get('bank_code', ''),
        channel_code=result.get('channel_code', ''),
        payment_url=result.get('payment_url', ''),
        expires_at=result.get('expires_at'),
    )

    logger.info('Xendit payment created: %s (%s) - Rp %s', payment.reference_id, payment_type, amount)

    return Response({
        'reference_id': payment.reference_id,
        'payment_type': payment.payment_type,
        'amount': float(payment.amount),
        'status': payment.status,
        'qr_string': payment.qr_string,
        'va_number': payment.va_number,
        'bank_code': payment.bank_code,
        'channel_code': payment.channel_code,
        'payment_url': payment.payment_url,
        'expires_at': payment.expires_at.isoformat() if payment.expires_at else None,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_status(request, reference_id):
    """
    GET /api/payments/xendit/check-status/<reference_id>/
    Polling dari frontend untuk cek apakah sudah dibayar.
    """
    try:
        payment = XenditPayment.objects.get(reference_id=reference_id)
    except XenditPayment.DoesNotExist:
        return Response({'error': 'Pembayaran tidak ditemukan'}, status=status.HTTP_404_NOT_FOUND)

    # Jika sudah final, langsung return tanpa hit Xendit API
    if payment.status in ('PAID', 'EXPIRED', 'FAILED'):
        return Response({
            'status': payment.status,
            'payment_type': payment.payment_type,
            'payment_channel': payment.payment_channel,
            'paid_at': payment.paid_at.isoformat() if payment.paid_at else None,
            'reference_id': reference_id,
            'amount': float(payment.amount),
        })

    # Cek ke Xendit API
    if payment.xendit_id:
        result = check_payment_status(payment)
        new_status = result.get('status', payment.status)

        if new_status != payment.status:
            payment.status = new_status
            if new_status == 'PAID':
                payment.payment_channel = result.get('payment_channel', payment.payment_type)
                payment.paid_at = result.get('paid_at') or timezone.now()
            payment.save()

    return Response({
        'status': payment.status,
        'payment_type': payment.payment_type,
        'payment_channel': payment.payment_channel,
        'paid_at': payment.paid_at.isoformat() if payment.paid_at else None,
        'reference_id': reference_id,
        'amount': float(payment.amount),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simulate(request, reference_id):
    """
    POST /api/payments/xendit/simulate/<reference_id>/
    Simulasi pembayaran di test mode — langsung set status ke PAID.
    """
    try:
        payment = XenditPayment.objects.get(reference_id=reference_id)
    except XenditPayment.DoesNotExist:
        return Response({'error': 'Pembayaran tidak ditemukan'}, status=status.HTTP_404_NOT_FOUND)

    if payment.status == 'PAID':
        return Response({'status': 'PAID', 'message': 'Pembayaran sudah lunas'})

    result = simulate_payment(payment)

    if result.get('success'):
        return Response({
            'status': 'PAID',
            'message': 'Pembayaran berhasil disimulasikan!',
            'payment_channel': payment.payment_channel,
        })
    else:
        return Response({
            'error': result.get('error', 'Gagal simulasi'),
        }, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['POST'])
@permission_classes([AllowAny])
def webhook(request):
    """
    POST /api/payments/xendit/webhook/
    Dipanggil oleh Xendit saat pembayaran berhasil.
    Handles QR codes, VA, dan eWallet callbacks.
    """
    callback_token = request.headers.get('x-callback-token', '')
    expected_token = getattr(settings, 'XENDIT_WEBHOOK_TOKEN', '')

    if expected_token and callback_token != expected_token:
        logger.warning("Xendit webhook: invalid token received")
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        data = request.data
        
        # Try to find the payment by various ID fields
        reference_id = (
            data.get('reference_id') or 
            data.get('external_id') or 
            data.get('data', {}).get('reference_id', '')
        )
        
        if not reference_id:
            logger.warning("Xendit webhook: no reference_id found in payload")
            return Response({'message': 'ignored - no reference_id'})

        try:
            payment = XenditPayment.objects.get(reference_id=reference_id)
        except XenditPayment.DoesNotExist:
            logger.warning(f"Xendit webhook: payment not found for reference_id={reference_id}")
            return Response({'message': 'ignored - payment not found'})

        # Determine new status from webhook data
        webhook_status = data.get('status', data.get('data', {}).get('status', ''))
        status_map = {
            'COMPLETED': 'PAID',
            'SUCCEEDED': 'PAID',
            'PAID': 'PAID',
            'SETTLED': 'PAID',
            'ACTIVE': 'PENDING',  # QR still active
            'INACTIVE': 'PAID',   # QR paid
            'EXPIRED': 'EXPIRED',
            'FAILED': 'FAILED',
        }
        new_status = status_map.get(webhook_status.upper() if webhook_status else '', None)
        
        if new_status and new_status != payment.status:
            payment.status = new_status
            if new_status == 'PAID':
                payment.payment_channel = data.get('payment_channel', data.get('channel_code', payment.payment_type))
                payment.paid_at = timezone.now()
            payment.save()
            logger.info(f"Xendit webhook: {reference_id} -> {new_status}")

        return Response({'message': 'OK'})

    except Exception as e:
        logger.error(f"Xendit webhook error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
