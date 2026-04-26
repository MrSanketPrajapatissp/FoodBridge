"""
Quick test: phone validation + contact exchange in claims
"""
import os, django, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
sys.stdout.reconfigure(encoding='utf-8')

from core.serializers import RegisterSerializer

PASS = "[PASS]"
FAIL = "[FAIL]"
SEP  = "=" * 50

print(SEP)
print("  TEST: Phone Number Validation")
print(SEP)

# Test 1: Valid phone
data = {'email': 'test_phone1@test.com', 'password': 'Test@1234', 'full_name': 'Test User', 'phone_number': '9876543210', 'role': 'DONOR'}
ser = RegisterSerializer(data=data)
if ser.is_valid():
    print(f"  {PASS} 9876543210 -> accepted (starts with 9, 10 digits)")
else:
    print(f"  {FAIL} Should be valid: {ser.errors}")

# Test 2: Invalid phone (too short)
data2 = {'email': 'test_phone2@test.com', 'password': 'Test@1234', 'full_name': 'Test User', 'phone_number': '12345', 'role': 'DONOR'}
ser2 = RegisterSerializer(data=data2)
if not ser2.is_valid():
    print(f"  {PASS} 12345 -> rejected ({ser2.errors.get('phone_number', [''])[0][:50]})")
else:
    print(f"  {FAIL} Should have rejected 12345")

# Test 3: Invalid phone (starts with 5)
data3 = {'email': 'test_phone3@test.com', 'password': 'Test@1234', 'full_name': 'Test User', 'phone_number': '5123456789', 'role': 'DONOR'}
ser3 = RegisterSerializer(data=data3)
if not ser3.is_valid():
    print(f"  {PASS} 5123456789 -> rejected (doesn't start with 6-9)")
else:
    print(f"  {FAIL} Should have rejected number starting with 5")

# Test 4: Valid phone starting with 6
data4 = {'email': 'test_phone4@test.com', 'password': 'Test@1234', 'full_name': 'Test User', 'phone_number': '6123456789', 'role': 'NGO'}
ser4 = RegisterSerializer(data=data4)
if ser4.is_valid():
    print(f"  {PASS} 6123456789 -> accepted (starts with 6, 10 digits)")
else:
    print(f"  {FAIL} Should be valid: {ser4.errors}")

print(f"\n{SEP}")
print("  TEST: Contact exchange email function exists")
print(SEP)

from core.email_utils import send_contact_exchange_email
print(f"  {PASS} send_contact_exchange_email imported successfully")

print(f"\n{SEP}")
print("  TEST: my_claims returns donor contact fields")
print(SEP)

from core.models import User
from donations.views_claims import my_claims
# Just check the function exists and handles the donor fields
import inspect
src = inspect.getsource(my_claims)
if 'donor_name' in src and 'donor_phone' in src and 'donor_email' in src:
    print(f"  {PASS} my_claims includes donor_name, donor_phone, donor_email")
else:
    print(f"  {FAIL} my_claims missing donor contact fields")

print(f"\n{SEP}")
print("  ALL CHECKS DONE")
print(SEP)
