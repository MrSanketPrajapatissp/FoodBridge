import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from decimal import Decimal
from donations.models import Donation
from donations.utils import geocode_address
import time

nulls = Donation.objects.filter(location_lat__isnull=True)
print(f"Found {nulls.count()} donations with NULL coordinates")

for d in nulls:
    addr = d.pickup_address
    
    # Extract city name from address for fallback
    # Common patterns: "Locality, City" or "Locality City"
    parts = [p.strip() for p in addr.replace(',', ' ').split()]
    
    # Try multiple strategies
    attempts = [
        addr,
        f"{addr}, Maharashtra, India",
        f"{addr}, India",
    ]
    
    # Add city-level fallback: last word is usually the city
    if len(parts) >= 2:
        city = parts[-1]  # e.g. "Amravati" from "Sainagar, Amravati"
        attempts.append(f"{city}, Maharashtra, India")
        attempts.append(f"{city}, India")
    
    success = False
    for attempt in attempts:
        print(f"  Trying ID:{d.id} -> \"{attempt}\"...")
        lat, lng = geocode_address(attempt)
        if lat and lng:
            d.location_lat = round(Decimal(str(lat)), 6)
            d.location_lng = round(Decimal(str(lng)), 6)
            d.save(update_fields=["location_lat", "location_lng"])
            print(f"  [OK] ID:{d.id} -> {d.location_lat}, {d.location_lng}")
            success = True
            break
        time.sleep(1.1)
    
    if not success:
        print(f"  [FAIL] ID:{d.id} all attempts failed")
    time.sleep(1.1)

print("\n=== FINAL STATE ===")
for d in Donation.objects.all():
    print(f"ID:{d.id} | {d.title} | lat:{d.location_lat} lng:{d.location_lng} | status:{d.status}")

print("Done.")
