import requests

# Test donation list API
r = requests.get('http://localhost:8000/api/donations/?food_type=ALL')
print(f"Status: {r.status_code}")
data = r.json()
print(f"Donations returned: {len(data)}")
for d in data:
    print(f"  ID:{d['id']} | {d['title']} | status:{d['status']} | lat:{d.get('location_lat')} lng:{d.get('location_lng')}")

# Verify claims state
print("\n--- Checking if stale claims were released ---")
r2 = requests.get('http://localhost:8000/api/donations/?food_type=ALL')
for d in r2.json():
    print(f"  ID:{d['id']} | {d['title']} | {d['status']}")
