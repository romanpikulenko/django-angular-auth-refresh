# Generated by Django 5.0.2 on 2024-02-21 12:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_reset'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='tfa_secret',
            field=models.CharField(default='', max_length=255),
        ),
    ]