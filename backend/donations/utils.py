import math
def haversine_distance(lat1,lng1,lat2,lng2):
  if lat1 is None or lng1 is None or lat2 is None or lng2 is None:
    return None
  R=6371; lat1,lng1,lat2,lng2=map(math.radians,[float(lat1),float(lng1),float(lat2),float(lng2)])
  a=math.sin((lat2-lat1)/2)**2+math.cos(lat1)*math.cos(lat2)*math.sin((lng2-lng1)/2)**2
  return round(R*2*math.asin(math.sqrt(a)),2)

from geopy.geocoders import Nominatim
import time

def geocode_address(address):
  """
  Geocode an address string. If the exact address fails (common for local
  area names), fall back to city-level or broader geocoding.
  """
  geolocator = Nominatim(user_agent="foodbridge_app")
  
  # Build list of attempts: exact -> with state/country -> city only
  parts = [p.strip() for p in address.replace(',', ' ').split()]
  attempts = [
      address,
      f"{address}, Maharashtra, India",
      f"{address}, India",
  ]
  if len(parts) >= 2:
      city = parts[-1]
      attempts.append(f"{city}, Maharashtra, India")
      attempts.append(f"{city}, India")

  for attempt in attempts:
      try:
          location = geolocator.geocode(attempt)
          if location:
              return location.latitude, location.longitude
          time.sleep(1.1)  # Nominatim rate limit
      except Exception:
          time.sleep(1.1)
  
  return None, None
