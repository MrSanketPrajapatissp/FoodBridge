from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models; import secrets

class UserManager(BaseUserManager):
  def create_user(self,email,password=None,**kw):
    email=self.normalize_email(email); u=self.model(email=email,**kw); u.set_password(password); u.save(using=self._db); return u
  def create_superuser(self,email,password=None,**kw):
    kw.setdefault('is_staff',True); kw.setdefault('is_superuser',True); return self.create_user(email,password,**kw)

class User(AbstractBaseUser,PermissionsMixin):
  ROLES=[('DONOR','Donor'),('NGO','NGO'),('ADMIN','Admin')]
  email=models.EmailField(unique=True); full_name=models.CharField(max_length=255)
  phone_number=models.CharField(max_length=20,blank=True)
  role=models.CharField(max_length=10,choices=ROLES,default='DONOR')
  is_email_verified=models.BooleanField(default=False)
  email_verification_token=models.CharField(max_length=100,blank=True)
  is_active=models.BooleanField(default=True); is_staff=models.BooleanField(default=False)
  created_at=models.DateTimeField(auto_now_add=True)
  objects=UserManager(); USERNAME_FIELD='email'; REQUIRED_FIELDS=['full_name']
  def generate_verification_token(self):
    self.email_verification_token=secrets.token_urlsafe(32); self.save(); return self.email_verification_token

class Organization(models.Model):
  VSTATUS=[('PENDING','Pending'),('VERIFIED','Verified'),('REJECTED','Rejected')]
  user=models.OneToOneField(User,on_delete=models.CASCADE,related_name='organization')
  organization_name=models.CharField(max_length=255); registration_number=models.CharField(max_length=100)
  address=models.TextField(); city=models.CharField(max_length=100); state=models.CharField(max_length=100)
  location_lat=models.DecimalField(max_digits=9,decimal_places=6)
  location_lng=models.DecimalField(max_digits=9,decimal_places=6)
  service_radius_km=models.PositiveIntegerField(default=10)
  verification_status=models.CharField(max_length=10,choices=VSTATUS,default='PENDING')
  rejection_reason=models.TextField(blank=True,null=True); created_at=models.DateTimeField(auto_now_add=True)
