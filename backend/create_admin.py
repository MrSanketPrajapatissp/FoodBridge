import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import User

admin_email = 'foodbridge.admin.connect@gmail.com'
password = 'pass@123'

admin, created = User.objects.get_or_create(email=admin_email, defaults={'role': 'ADMIN', 'full_name': 'FoodBridge Admin'})
admin.set_password(password)
admin.role = 'ADMIN'
admin.save()
print(f"Admin {admin_email} created/updated successfully.")
