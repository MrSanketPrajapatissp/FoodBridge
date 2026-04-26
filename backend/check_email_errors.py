import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import EmailLog
logs = EmailLog.objects.filter(status='FAILED').order_by('-sent_at')[:3]
for log in logs:
    print(f"Recipient: {log.recipient_email}, Error: {log.error_message}")
