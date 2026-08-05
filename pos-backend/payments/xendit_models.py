"""
XenditPayment model — menyimpan data pembayaran digital Xendit per transaksi.
Mendukung QRIS (QR dinamis), Virtual Account, dan E-Wallet.
"""
from django.db import models
from businesses.models import Business


class XenditPayment(models.Model):
    """
    Menyimpan pembayaran Xendit per transaksi POS.
    Satu transaksi bisa punya satu XenditPayment aktif.
    """
    PAYMENT_TYPES = [
        ('QRIS', 'QRIS'),
        ('VA', 'Virtual Account'),
        ('EWALLET', 'E-Wallet'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Menunggu Pembayaran'),
        ('PAID', 'Sudah Dibayar'),
        ('EXPIRED', 'Kadaluwarsa'),
        ('FAILED', 'Gagal'),
    ]

    business = models.ForeignKey(
        Business, on_delete=models.CASCADE, related_name='xendit_payments'
    )
    # ID referensi unik kita
    reference_id = models.CharField(max_length=200, unique=True)
    # ID dari Xendit (qr_id, va_id, charge_id)
    xendit_id = models.CharField(max_length=200, blank=True)
    # Tipe pembayaran
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    # Total tagihan
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    # Status saat ini
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    # Data spesifik per tipe pembayaran
    qr_string = models.TextField(blank=True, help_text="QR string untuk dirender jadi QR code (QRIS)")
    va_number = models.CharField(max_length=50, blank=True, help_text="Nomor Virtual Account")
    bank_code = models.CharField(max_length=20, blank=True, help_text="Kode bank: BCA, BNI, BRI, dll")
    channel_code = models.CharField(max_length=50, blank=True, help_text="Channel eWallet: ID_GOPAY, ID_OVO, dll")
    payment_url = models.URLField(blank=True, help_text="URL redirect pembayaran (eWallet)")

    # Metadata setelah pembayaran
    payment_channel = models.CharField(max_length=100, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"XenditPayment {self.reference_id} ({self.payment_type}) - {self.status} - Rp {self.amount}"
