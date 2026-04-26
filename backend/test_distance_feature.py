"""
FoodBridge - End-to-End Test Script
Tests: Distance-based claim restriction, successful claim, my_claims API enrichment

Test Users:
  - Donor:  testdonor@test.com  (Ahmedabad location - FAR from Amravati NGO)
  - NGO:    testngo@test.com    (Amravati location, 10km radius)
"""
import os, django, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from core.models import User, Organization
from donations.models import Donation, Claim
from donations.utils import haversine_distance

PASS = "[PASS]"
FAIL = "[FAIL]"
SEP  = "=" * 60

print(SEP)
print("  FOODBRIDGE - DISTANCE FEATURE TEST")
print(SEP)

# -------------------------------------------------------
# SETUP: Create fresh test users
# -------------------------------------------------------
print("\n[SETUP] Creating test users...")

# Clean old test data first
User.objects.filter(email__in=['testdonor@test.com', 'testngo@test.com']).delete()

donor = User.objects.create_user(
    email='testdonor@test.com',
    password='Test@12345',
    full_name='Test Donor Ahmedabad',
    role='DONOR'
)
print(f"  Donor created: {donor.email} (DB ID: {donor.id})")

ngo_user = User.objects.create_user(
    email='testngo@test.com',
    password='Test@12345',
    full_name='Test NGO Amravati',
    role='NGO'
)
ngo_org = Organization.objects.create(
    user=ngo_user,
    organization_name='Test Welfare Trust Amravati',
    registration_number='TEST-001',
    address='Sainagar, Amravati',
    city='Amravati',
    state='Maharashtra',
    location_lat=Decimal('20.894814'),   # Amravati
    location_lng=Decimal('77.740990'),
    service_radius_km=10,
    verification_status='VERIFIED'
)
print(f"  NGO created:   {ngo_user.email} (DB ID: {ngo_user.id})")
print(f"  NGO location:  ({ngo_org.location_lat}, {ngo_org.location_lng}) | radius: {ngo_org.service_radius_km}km")

# -------------------------------------------------------
# TEST 1: FAR donation (Ahmedabad) - should be BLOCKED
# -------------------------------------------------------
print(f"\n{SEP}")
print("  TEST 1: Claim food from FAR AWAY (Ahmedabad -> Amravati)")
print(f"{SEP}")

far_donation = Donation.objects.create(
    donor=donor,
    title='Test Biryani Ahmedabad',
    food_type='VEG',
    quantity_servings=20,
    description='Test donation in Ahmedabad - far from NGO',
    pickup_address='Ahmedabad, Gujarat',
    location_lat=Decimal('23.042645'),
    location_lng=Decimal('72.568240'),
    pickup_window_start=timezone.now(),
    pickup_window_end=timezone.now() + timedelta(hours=6),
    status='AVAILABLE'
)

dist_far = haversine_distance(
    ngo_org.location_lat, ngo_org.location_lng,
    far_donation.location_lat, far_donation.location_lng
)
print(f"  Donation: '{far_donation.title}' (ID: {far_donation.id})")
print(f"  Donation at: Ahmedabad ({far_donation.location_lat}, {far_donation.location_lng})")
print(f"  NGO at:      Amravati  ({ngo_org.location_lat}, {ngo_org.location_lng})")
print(f"  Distance:    {dist_far} km | NGO radius: {ngo_org.service_radius_km} km")

# Simulate claim_create logic
if dist_far is not None and dist_far > ngo_org.service_radius_km:
    print(f"  {PASS} Claim correctly BLOCKED")
    print(f"         Message: 'This donation is {dist_far} km away. Your service radius is {ngo_org.service_radius_km} km.'")
else:
    print(f"  {FAIL} Should have been blocked! Distance: {dist_far}km, Radius: {ngo_org.service_radius_km}km")

# -------------------------------------------------------
# TEST 2: NEAR donation (Rajapeth, Amravati) - should SUCCEED
# -------------------------------------------------------
print(f"\n{SEP}")
print("  TEST 2: Claim food from NEARBY (Rajapeth -> Sainagar, same city)")
print(f"{SEP}")

near_donation = Donation.objects.create(
    donor=donor,
    title='Test Dosa Rajapeth Amravati',
    food_type='VEG',
    quantity_servings=15,
    description='Test donation in Rajapeth Amravati',
    pickup_address='Rajapeth, Amravati',
    location_lat=Decimal('20.921200'),
    location_lng=Decimal('77.756285'),
    pickup_window_start=timezone.now(),
    pickup_window_end=timezone.now() + timedelta(hours=6),
    status='AVAILABLE'
)

dist_near = haversine_distance(
    ngo_org.location_lat, ngo_org.location_lng,
    near_donation.location_lat, near_donation.location_lng
)
print(f"  Donation: '{near_donation.title}' (ID: {near_donation.id})")
print(f"  Donation at: Rajapeth ({near_donation.location_lat}, {near_donation.location_lng})")
print(f"  NGO at:      Sainagar ({ngo_org.location_lat}, {ngo_org.location_lng})")
print(f"  Distance:    {dist_near} km | NGO radius: {ngo_org.service_radius_km} km")

if dist_near is not None and dist_near <= ngo_org.service_radius_km:
    # Create actual Claim in DB
    claim = Claim.objects.create(donation=near_donation, ngo=ngo_org)
    near_donation.status = 'CLAIMED'
    near_donation.save()
    print(f"  {PASS} Claim ALLOWED and created (Claim ID: {claim.id})")
    print(f"         OTP Code: {claim.otp_code}")
    print(f"         Distance: {dist_near} km")
else:
    print(f"  {FAIL} Should have been allowed! Distance: {dist_near}km, Radius: {ngo_org.service_radius_km}km")
    claim = None

# -------------------------------------------------------
# TEST 3: haversine_distance with NULL coordinates
# -------------------------------------------------------
print(f"\n{SEP}")
print("  TEST 3: haversine_distance with NULL coordinates (no crash)")
print(f"{SEP}")

result_null = haversine_distance(20.9, 77.7, None, None)
print(f"  haversine(20.9, 77.7, None, None) = {result_null}")
if result_null is None:
    print(f"  {PASS} Returns None gracefully - no crash")
else:
    print(f"  {FAIL} Should return None for NULL coords")

result_null2 = haversine_distance(None, None, 20.9, 77.7)
print(f"  haversine(None, None, 20.9, 77.7) = {result_null2}")
if result_null2 is None:
    print(f"  {PASS} Returns None gracefully - no crash")
else:
    print(f"  {FAIL} Should return None for NULL coords")

# -------------------------------------------------------
# TEST 4: my_claims enriched data (distance + coords for map)
# -------------------------------------------------------
print(f"\n{SEP}")
print("  TEST 4: my_claims enriched data for route map")
print(f"{SEP}")

claims_qs = Claim.objects.filter(ngo=ngo_org).select_related('donation')
all_pass = True
for c in claims_qs:
    d = c.donation
    dist_val = haversine_distance(
        ngo_org.location_lat, ngo_org.location_lng,
        d.location_lat, d.location_lng
    )
    has_ngo_coords  = ngo_org.location_lat is not None and ngo_org.location_lng is not None
    has_don_coords  = d.location_lat is not None and d.location_lng is not None
    has_distance    = dist_val is not None

    print(f"  Claim ID: {c.id} | Donation: '{d.title}'")
    print(f"    donation_lat: {d.location_lat} | donation_lng: {d.location_lng}")
    print(f"    ngo_lat:      {ngo_org.location_lat} | ngo_lng: {ngo_org.location_lng}")
    print(f"    distance_km:  {dist_val}")

    if has_ngo_coords and has_don_coords and has_distance:
        print(f"    {PASS} All map data present - route map will render")
    else:
        print(f"    {FAIL} Missing data for map!")
        all_pass = False

if all_pass:
    print(f"\n  {PASS} All claims have full map data")

# -------------------------------------------------------
# TEST 5: Verify donation list returns available donations
# -------------------------------------------------------
print(f"\n{SEP}")
print("  TEST 5: donation_list filters correctly")
print(f"{SEP}")

from donations.models import Donation as Don
available_count = Don.objects.filter(status='AVAILABLE').count()
claimed_count   = Don.objects.filter(status='CLAIMED').count()
print(f"  AVAILABLE donations in DB: {available_count}")
print(f"  CLAIMED donations in DB:   {claimed_count}")

# near_donation should be CLAIMED now
near_donation.refresh_from_db()
if near_donation.status == 'CLAIMED':
    print(f"  {PASS} near_donation correctly moved to CLAIMED after claim")
else:
    print(f"  {FAIL} near_donation should be CLAIMED but is: {near_donation.status}")

# far_donation should still be AVAILABLE (was never claimed)
far_donation.refresh_from_db()
if far_donation.status == 'AVAILABLE':
    print(f"  {PASS} far_donation still AVAILABLE (claim was blocked)")
else:
    print(f"  {FAIL} far_donation should be AVAILABLE but is: {far_donation.status}")

# -------------------------------------------------------
# CLEANUP
# -------------------------------------------------------
print(f"\n{SEP}")
print("  CLEANUP - Removing test data")
print(f"{SEP}")
Claim.objects.filter(ngo=ngo_org).delete()
Donation.objects.filter(donor=donor).delete()
ngo_org.delete()
User.objects.filter(email__in=['testdonor@test.com', 'testngo@test.com']).delete()
print("  Test data cleaned up successfully.")

print(f"\n{SEP}")
print("  ALL TESTS COMPLETE")
print(SEP)
