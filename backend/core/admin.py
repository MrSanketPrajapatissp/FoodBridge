from django.contrib import admin
from .models import User, Organization
from django.core.mail import send_mail

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'role', 'is_email_verified', 'is_staff')
    list_filter = ('role', 'is_email_verified', 'is_staff')
    search_fields = ('email', 'full_name')

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('organization_name', 'city', 'verification_status', 'created_at')
    list_filter = ('verification_status', 'city')
    search_fields = ('organization_name', 'registration_number')
    actions = ['verify_organizations']

    def verify_organizations(self, request, queryset):
        for org in queryset:
            org.verification_status = 'VERIFIED'
            org.save()
            # Send notification
            try:
                send_mail(
                    'Organization Verified - FoodBridge',
                    f'Congratulations! Your organization "{org.organization_name}" has been verified. You can now start claiming food donations on the platform.',
                    'admin@foodbridge.com',
                    [org.user.email],
                    fail_silently=True
                )
            except: pass
        self.message_user(request, f"{queryset.count()} organizations have been verified.")
    verify_organizations.short_description = "Verify selected NGOs"
