from django.contrib import admin
from .models import Donation, DonationPhoto, Claim

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('title', 'food_type', 'quantity_servings', 'status', 'created_at')
    list_filter = ('food_type', 'status')
    search_fields = ('title', 'description')

@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('id', 'donation', 'ngo', 'status', 'otp_code')
    list_filter = ('status',)
    search_fields = ('donation__title', 'ngo__organization_name')

admin.site.register(DonationPhoto)
