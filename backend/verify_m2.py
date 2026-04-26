import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import User, Organization

try:
    u = User.objects.get(email='testngo1@foodbridge.com')
    print(f"User found: {u.email}")
    org = Organization.objects.get(user=u)
    print(f"Organization: {org.organization_name}")
    print(f"Status: {org.verification_status}")
    print(f"Location: {org.location_lat}, {org.location_lng}")
    print(f"Radius: {org.service_radius_km} km")
except Exception as e:
    print(f"Error: {e}")
