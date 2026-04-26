import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import User, Organization

# Create Donor
donor, _ = User.objects.get_or_create(
    email='prajapatisanketssp321@gmail.com',
    defaults={'role': 'DONOR', 'full_name': 'Sanket Donor', 'is_email_verified': True}
)
donor.set_password('pass@123')
donor.save()
print(f"Donor created: {donor.email}")

# Create NGO
ngo, _ = User.objects.get_or_create(
    email='sanketprajapatipdp@gmail.com',
    defaults={'role': 'NGO', 'full_name': 'Sanket NGO', 'is_email_verified': True}
)
ngo.set_password('pass@123')
ngo.save()
print(f"NGO created: {ngo.email}")

# Create Org Profile for NGO to ensure they are VERIFIED
org, _ = Organization.objects.get_or_create(
    user=ngo,
    defaults={
        'organization_name': 'Sanket Welfare',
        'registration_number': 'REG-SANKET-1',
        'address': 'Dadar West',
        'city': 'Mumbai',
        'state': 'Maharashtra',
        'location_lat': 19.0176,
        'location_lng': 72.8426,
        'service_radius_km': 20,
        'verification_status': 'VERIFIED'
    }
)
if org.verification_status != 'VERIFIED':
    org.verification_status = 'VERIFIED'
    org.save()
print(f"NGO Organization created and VERIFIED: {org.organization_name}")

