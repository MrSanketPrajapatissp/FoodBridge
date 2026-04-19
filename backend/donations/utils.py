import math
def haversine_distance(lat1,lng1,lat2,lng2):
  R=6371; lat1,lng1,lat2,lng2=map(math.radians,[float(lat1),float(lng1),float(lat2),float(lng2)])
  a=math.sin((lat2-lat1)/2)**2+math.cos(lat1)*math.cos(lat2)*math.sin((lng2-lng1)/2)**2
  return round(R*2*math.asin(math.sqrt(a)),2)

from geopy.geocoders import Nominatim
def geocode_address(address):
  try:
    geolocator = Nominatim(user_agent="foodbridge_app")
    location = geolocator.geocode(address)
    if location: return location.latitude, location.longitude
    return None, None
  except: return None, None
