"""
Audit Log Model — Records all significant actions within each business.
Multi-tenant: Isolated per business.
"""
from django.db import models
from businesses.models import Business
from accounts.models import BusinessUser


class AuditLog(models.Model):
    """
    Audit trail for business operations.
    Tracks: who did what, when, and what data changed.
    """
    ACTION_TYPES = [
        ('CREATE', 'Membuat'),
        ('UPDATE', 'Mengubah'),
        ('DELETE', 'Menghapus'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('VOID', 'Void Transaksi'),
        ('CHECKOUT', 'Checkout'),
        ('NOTIFY', 'Kirim Notifikasi'),
        ('PASSWORD', 'Ganti Password'),
    ]

    business = models.ForeignKey(
        Business, on_delete=models.CASCADE, related_name='audit_logs',
        help_text="Bisnis yang memiliki log ini"
    )
    actor = models.ForeignKey(
        BusinessUser, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='audit_actions',
        help_text="User yang melakukan aksi (null jika user sudah dihapus)"
    )
    actor_name = models.CharField(
        max_length=100,
        help_text="Snapshot nama user saat aksi dilakukan (tetap ada walau user dihapus)"
    )
    actor_role = models.CharField(
        max_length=20,
        help_text="Role user saat aksi: 'admin' atau 'kasir'"
    )
    action = models.CharField(
        max_length=20, choices=ACTION_TYPES,
        help_text="Tipe aksi yang dilakukan"
    )
    target_type = models.CharField(
        max_length=50,
        help_text="Tipe objek target: Product, Category, Transaction, dll"
    )
    target_id = models.IntegerField(
        null=True, blank=True,
        help_text="ID objek target (null jika tidak berlaku)"
    )
    description = models.TextField(
        help_text="Deskripsi human-readable: 'Mengubah harga Mie Goreng dari Rp 3.000 ke Rp 3.500'"
    )
    old_data = models.JSONField(
        null=True, blank=True,
        help_text="Data sebelum perubahan (JSON)"
    )
    new_data = models.JSONField(
        null=True, blank=True,
        help_text="Data setelah perubahan (JSON)"
    )
    ip_address = models.GenericIPAddressField(
        null=True, blank=True,
        help_text="IP address user saat aksi dilakukan"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_log'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['business', '-created_at']),
            models.Index(fields=['action']),
            models.Index(fields=['actor']),
            models.Index(fields=['target_type']),
        ]
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'

    def __str__(self):
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {self.actor_name} ({self.actor_role}) - {self.get_action_display()} {self.target_type}"
