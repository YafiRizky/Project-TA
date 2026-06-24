from django.db import models
from businesses.models import Business
from products.models import Product

class DiscountRule(models.Model):
    DISCOUNT_TYPES = [
        ('PERCENTAGE', 'Persentase (%)'),
        ('NOMINAL', 'Nominal (Rp)'),
    ]

    business = models.ForeignKey(
        Business, on_delete=models.CASCADE, related_name='discount_rules'
    )
    name = models.CharField(max_length=200, help_text="Contoh: Promo Beli 2 Galon Diskon 7%")
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='PERCENTAGE')
    discount_value = models.DecimalField(
        max_digits=12, decimal_places=2,
        help_text="Isi persentase (contoh: 10 untuk 10%) atau nominal (contoh: 5000 untuk Rp 5.000)"
    )
    min_quantity = models.PositiveIntegerField(
        default=1, 
        help_text="Minimal pembelian item (pada produk yang dipilih) agar diskon berlaku. Contoh: 2 untuk beli 2 dapat diskon."
    )
    products = models.ManyToManyField(
        Product, related_name='discounts', blank=True,
        help_text="Produk yang terkena diskon ini. Jika kosong, diskon TIDAK berlaku kemana-mana."
    )
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'promotions_discount_rule'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_discount_type_display()}: {self.discount_value}) - Min Qty: {self.min_quantity}"
