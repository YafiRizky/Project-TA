"""
Management command: reset_business_data
Menghapus semua data bisnis dan user bisnis.
TIDAK menghapus TechnicalAdmin (superuser Django).

Usage:
    python manage.py reset_business_data
    python manage.py reset_business_data --confirm
"""
from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = 'Reset semua data bisnis (produk, batch, transaksi, user bisnis). TechnicalAdmin/superuser TIDAK tersentuh.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Jalankan reset tanpa konfirmasi interaktif',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(self.style.WARNING('\n=== PERINGATAN ==='))
            self.stdout.write('Perintah ini akan MENGHAPUS PERMANEN:')
            self.stdout.write('  - Semua BusinessUser (admin & kasir toko)')
            self.stdout.write('  - Semua Business (data toko)')
            self.stdout.write('  - Semua Product, Category, Supplier')
            self.stdout.write('  - Semua ProductBatch, InventoryMovement, StockOpname')
            self.stdout.write('  - Semua Transaction, TransactionItem')
            self.stdout.write('  - Semua PaymentMethod')
            self.stdout.write('  - Semua AuditLog')
            self.stdout.write(self.style.WARNING('\nTechnicalAdmin (superuser Django) TIDAK akan dihapus.\n'))
            confirm = input('Ketik "YA HAPUS" untuk melanjutkan: ')
            if confirm != 'YA HAPUS':
                self.stdout.write(self.style.ERROR('Reset dibatalkan.'))
                return

        self.stdout.write('\nMemulai reset database bisnis...')

        with transaction.atomic():
            # Import semua model yang perlu dihapus
            deleted_counts = {}

            # 1. Hapus AuditLog dulu (tidak ada FK constraint ke business langsung)
            try:
                from auditlog.models import AuditLog
                count, _ = AuditLog.objects.all().delete()
                deleted_counts['AuditLog'] = count
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip AuditLog: {e}'))

            # 2. Hapus Transactions & Items (FK ke business, product, batch)
            try:
                from transactions.models import Transaction, TransactionItem
                count, _ = TransactionItem.objects.all().delete()
                deleted_counts['TransactionItem'] = count
                count, _ = Transaction.objects.all().delete()
                deleted_counts['Transaction'] = count
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip Transactions: {e}'))

            # 3. Hapus Inventory (FK ke product, business)
            try:
                from inventory.models import InventoryMovement, ProductBatch, StockOpname, StockOpnameItem
                count, _ = StockOpnameItem.objects.all().delete()
                deleted_counts['StockOpnameItem'] = count
                count, _ = StockOpname.objects.all().delete()
                deleted_counts['StockOpname'] = count
                count, _ = InventoryMovement.objects.all().delete()
                deleted_counts['InventoryMovement'] = count
                count, _ = ProductBatch.objects.all().delete()
                deleted_counts['ProductBatch'] = count
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip Inventory: {e}'))

            # 4. Hapus Promotions (jika ada)
            try:
                from promotions.models import Discount
                count, _ = Discount.objects.all().delete()
                deleted_counts['Discount'] = count
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip Promotions: {e}'))

            # 5. Hapus Products, Categories, Suppliers
            try:
                from products.models import Product, Category, Supplier
                count, _ = Product.objects.all().delete()
                deleted_counts['Product'] = count
                count, _ = Category.objects.all().delete()
                deleted_counts['Category'] = count
                count, _ = Supplier.objects.all().delete()
                deleted_counts['Supplier'] = count
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip Products: {e}'))

            # 6. Hapus PaymentMethod
            try:
                from payments.models import PaymentMethod
                count, _ = PaymentMethod.objects.all().delete()
                deleted_counts['PaymentMethod'] = count
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip PaymentMethods: {e}'))

            # 7. Hapus Notifications (jika ada)
            try:
                from notifications.models import Notification
                count, _ = Notification.objects.all().delete()
                deleted_counts['Notification'] = count
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip Notifications: {e}'))

            # 8. Hapus BusinessUser (BUKAN TechnicalAdmin/superuser)
            try:
                from accounts.models import BusinessUser
                count, _ = BusinessUser.objects.all().delete()
                deleted_counts['BusinessUser'] = count
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip BusinessUser: {e}'))

            # 9. Hapus Business (terakhir karena yang lain FK ke sini)
            try:
                from businesses.models import Business
                count, _ = Business.objects.all().delete()
                deleted_counts['Business'] = count
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip Business: {e}'))

        # Laporan hasil
        self.stdout.write('\n' + self.style.SUCCESS('=== RESET BERHASIL ==='))
        for model, count in deleted_counts.items():
            if count > 0:
                self.stdout.write(f'  Dihapus {count:>5} baris dari {model}')
            else:
                self.stdout.write(f'  (kosong) {model}')

        self.stdout.write(self.style.SUCCESS('\nDatabase bisnis telah direset.'))
        self.stdout.write('TechnicalAdmin (superuser) tetap utuh.')
        self.stdout.write('Silakan daftar bisnis baru melalui /register di frontend.\n')
