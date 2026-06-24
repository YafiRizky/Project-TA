from django.db import models
from accounts.models import BusinessUser
from products.models import Product


class StockNotification(models.Model):
    """Notifikasi stok rendah/habis yang dikirim kasir ke admin."""
    
    NOTIF_TYPE_CHOICES = [
        ('LOW_STOCK', 'Stok Rendah'),
        ('OUT_OF_STOCK', 'Stok Habis'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_notifications')
    sender = models.ForeignKey(BusinessUser, on_delete=models.CASCADE, related_name='sent_notifications')
    business = models.ForeignKey('businesses.Business', on_delete=models.CASCADE, related_name='notifications')
    notif_type = models.CharField(max_length=20, choices=NOTIF_TYPE_CHOICES, default='LOW_STOCK')
    message = models.TextField(blank=True, default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"[{self.notif_type}] {self.product.name} - by {self.sender.username}"
