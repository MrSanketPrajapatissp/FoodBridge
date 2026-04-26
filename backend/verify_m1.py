import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import User, EmailLog

try:
    u = User.objects.get(email='testngo1@foodbridge.com')
    print(f"User: {u.email}, Role: {u.role}, Verified: {u.is_email_verified}")
    logs = EmailLog.objects.filter(recipient_email=u.email)
    for log in logs:
        print(f"Email sent: {log.subject}")
except User.DoesNotExist:
    print("User not found.")
