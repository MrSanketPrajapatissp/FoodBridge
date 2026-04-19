from django.utils import timezone; from .models import Donation
def expire_donations():
  n=Donation.objects.filter(expires_at__lt=timezone.now(),status='AVAILABLE').update(status='EXPIRED')
  print(f"[Q] expired {n} donations")
