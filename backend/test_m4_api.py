import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import User, Organization, Notification, EmailLog
from donations.models import Donation, Claim
from django.utils import timezone
from rest_framework.test import APIClient

client = APIClient()

# Get users
donor, _ = User.objects.get_or_create(email='prajapatisanketssp321@gmail.com', defaults={'role': 'DONOR', 'full_name': 'Donor'})
ngo, _ = User.objects.get_or_create(email='prajapatisanketpdp@gmail.com', defaults={'role': 'NGO', 'full_name': 'NGO'})
admin, _ = User.objects.get_or_create(email='admin_m4@test.com', defaults={'role': 'ADMIN', 'full_name': 'Admin'})
if not admin.check_password('password'):
    admin.set_password('password')
    admin.save()

# Tokens
from rest_framework_simplejwt.tokens import RefreshToken
donor_token = str(RefreshToken.for_user(donor).access_token)
ngo_token = str(RefreshToken.for_user(ngo).access_token)
admin_token = str(RefreshToken.for_user(admin).access_token)

def test_api():
    print("--- M4 API Tests ---")
    
    # M4-8: Admin Stats Endpoint
    res = client.get('/api/admin/stats/', HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    print(f"M4-8 (Admin): {res.status_code}")
    
    res = client.get('/api/admin/stats/', HTTP_AUTHORIZATION=f'Bearer {donor_token}')
    print(f"M4-8 (Donor): {res.status_code} (Expected 403)")
    
    # M4-9: Admin Pending NGO List
    res = client.get('/api/admin/ngos/pending/', HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    print(f"M4-9 (Admin): {res.status_code} - Data: {len(res.json())}")
    
    # M4-12: Email Logs
    res = client.get('/api/admin/email-logs/', HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    print(f"M4-12 (Admin): {res.status_code} - Data: {len(res.json())}")

test_api()
