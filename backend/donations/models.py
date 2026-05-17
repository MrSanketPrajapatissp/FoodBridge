from django.db import models; from core.models import User

class Donation(models.Model):
  FOOD=[('VEG','Veg'),('NON_VEG','Non-Veg'),('VEGAN','Vegan'),('MIXED','Mixed')]
  STATUS=[('AVAILABLE','Available'),('CLAIMED','Claimed'),('PICKED_UP','Picked Up'),('EXPIRED','Expired'),('CANCELLED','Cancelled')]
  donor=models.ForeignKey(User,on_delete=models.CASCADE,related_name='donations')
  title=models.CharField(max_length=255); food_type=models.CharField(max_length=10,choices=FOOD)
  quantity_servings=models.PositiveIntegerField(); description=models.TextField()
  allergen_notes=models.TextField(blank=True); pickup_address=models.TextField()
  location_lat=models.DecimalField(max_digits=9,decimal_places=6,null=True,blank=True)
  location_lng=models.DecimalField(max_digits=9,decimal_places=6,null=True,blank=True)
  pickup_window_start=models.DateTimeField(); pickup_window_end=models.DateTimeField()
  expires_at=models.DateTimeField(); status=models.CharField(max_length=10,choices=STATUS,default='AVAILABLE')
  created_at=models.DateTimeField(auto_now_add=True)
  def save(self,*a,**kw): self.expires_at=self.pickup_window_end; super().save(*a,**kw)

class Claim(models.Model):
  STATUS = [('CLAIMED','Claimed'),('PICKED_UP','Picked Up'),('CANCELLED','Cancelled')]
  donation = models.OneToOneField(Donation, on_delete=models.CASCADE, related_name='claim')
  ngo = models.ForeignKey('core.Organization', on_delete=models.CASCADE, related_name='claims')
  status = models.CharField(max_length=10, choices=STATUS, default='CLAIMED')
  otp_code = models.CharField(max_length=6, blank=True)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def save(self, *args, **kwargs):
    if not self.otp_code:
      import secrets
      self.otp_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    super().save(*args, **kwargs)

class DonationPhoto(models.Model):
  donation=models.ForeignKey(Donation,on_delete=models.CASCADE,related_name='photos')
  photo=models.ImageField(upload_to='donations/'); uploaded_at=models.DateTimeField(auto_now_add=True)
