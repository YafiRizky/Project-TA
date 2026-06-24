from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0004_stockopname_stockopnameitem'),
    ]

    operations = [
        # Remove old product FK
        migrations.RemoveField(
            model_name='stockopnameitem',
            name='product',
        ),
        # Add new batch FK
        migrations.AddField(
            model_name='stockopnameitem',
            name='batch',
            field=models.ForeignKey(
                default=1,  # Temporary default, table is empty after reset
                help_text='Batch being audited',
                on_delete=django.db.models.deletion.CASCADE,
                to='inventory.productbatch',
            ),
            preserve_default=False,
        ),
    ]
