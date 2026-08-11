from django.core.management.base import BaseCommand
from accounts.models import BusinessUser

class Command(BaseCommand):
    help = 'Auto-link Business Admin users to their primary business if business FK is NULL'

    def handle(self, *args, **options):
        unlinked = BusinessUser.objects.filter(role='admin', business__isnull=True)
        count = 0
        for user in unlinked:
            b = user.owned_businesses.first()
            if b:
                user.business = b
                user.save(update_fields=['business'])
                count += 1
                self.stdout.write(self.style.SUCCESS(f"Linked {user.username} ({user.owner_code}) -> {b.business_name} ({b.business_code})"))
        
        self.stdout.write(self.style.SUCCESS(f"Finished auto-linking {count} Business Admin accounts."))
