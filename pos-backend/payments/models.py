"""
Payment method models for POS system.
Admin configures payment methods, kasir uses them during transactions.
"""
from django.db import models
from businesses.models import Business
from .xendit_models import XenditPayment  # noqa: F401 — re-export for Django discovery


class PaymentMethod(models.Model):
    """
    Payment method configured by business admin.
    Kasir will see active methods during checkout.
    """
    METHOD_TYPES = [
        ('CASH', 'Tunai'),
        ('QRIS', 'QRIS'),
        ('TRANSFER', 'Transfer Bank'),
        ('EWALLET', 'E-Wallet'),
        ('CARD', 'Kartu Debit/Kredit'),
    ]
    
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='payment_methods')
    method_type = models.CharField(max_length=20, choices=METHOD_TYPES)
    name = models.CharField(max_length=100, help_text="Nama tampilan, e.g. 'BCA', 'GoPay', 'QRIS Toko'")
    account_number = models.CharField(max_length=100, blank=True, help_text="Nomor rekening/akun")
    account_name = models.CharField(max_length=100, blank=True, help_text="Nama pemilik rekening")
    qris_image = models.ImageField(upload_to='qris/', blank=True, null=True, help_text="Gambar QR Code QRIS")
    instructions = models.TextField(blank=True, help_text="Instruksi pembayaran tambahan")
    is_active = models.BooleanField(default=True)
    # Xendit integration fields
    use_xendit = models.BooleanField(default=False, help_text="Gunakan Xendit untuk proses pembayaran otomatis")
    xendit_channel = models.CharField(max_length=50, blank=True, help_text="Channel Xendit: BCA, BNI, ID_GOPAY, dll")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['method_type', 'name']
        unique_together = ['business', 'method_type', 'name']
    
    def __str__(self):
        return f"{self.get_method_type_display()} - {self.name} ({self.business.business_name})"


# =============================================================================
# SIGNAL: Auto-cleanup media files when PaymentMethod is deleted
# =============================================================================
from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver


@receiver(pre_delete, sender=PaymentMethod)
def cleanup_payment_media_on_delete(sender, instance, **kwargs):
    """Delete QRIS image file from disk when PaymentMethod record is deleted."""
    if instance.qris_image:
        instance.qris_image.delete(save=False)


@receiver(pre_save, sender=PaymentMethod)
def cleanup_old_media_on_update(sender, instance, **kwargs):
    """Delete old QRIS image file when replaced with a new one."""
    if not instance.pk:
        return  # New record, skip
    try:
        old = PaymentMethod.objects.get(pk=instance.pk)
    except PaymentMethod.DoesNotExist:
        return
    if old.qris_image and old.qris_image != instance.qris_image:
        old.qris_image.delete(save=False)

