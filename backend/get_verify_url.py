import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import User

u = User.objects.get(email='testngo1@foodbridge.com')
token = u.email_verification_token
url = f"http://localhost:5173/verify-email?token={token}"
print(f"VERIFY_URL: {url}")
