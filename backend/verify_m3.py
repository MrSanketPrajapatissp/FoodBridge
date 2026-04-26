import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from donations.models import Donation, Claim

donor_email = 'prajapatisanketssp321@gmail.com'
donations = Donation.objects.filter(donor__email=donor_email).order_by('-created_at')

if donations.exists():
    latest = donations.first()
    print(f"Donation Title: {latest.title}")
    print(f"Status: {latest.status}")
    claim = Claim.objects.filter(donation=latest).first()
    if claim:
        print(f"Claim by: {claim.ngo.email}")
        print(f"Claim Status: {claim.status}")
        print(f"OTP Verified: {claim.is_picked_up}")
else:
    print("No donations found.")
