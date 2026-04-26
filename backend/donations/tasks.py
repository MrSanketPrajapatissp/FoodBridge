from django.utils import timezone
from datetime import timedelta
from .models import Donation, Claim


def expire_donations():
    """Expire AVAILABLE donations past their pickup window."""
    n = Donation.objects.filter(
        expires_at__lt=timezone.now(), status='AVAILABLE'
    ).update(status='EXPIRED')
    if n:
        print(f"[TASK] Expired {n} donations")


def release_stale_claims(timeout_minutes=45):
    """
    Auto-release donations that were claimed but never picked up within
    the timeout period. This gives other NGOs a chance to claim the food.
    
    Logic:
    - Find all Claims with status='CLAIMED' older than timeout_minutes
    - Set Claim status to 'CANCELLED'
    - Set Donation status back to 'AVAILABLE'
    - Delete the Claim record (OneToOneField requires removal so another NGO can claim)
    - Send notifications to donor and NGO
    """
    cutoff = timezone.now() - timedelta(minutes=timeout_minutes)
    stale_claims = Claim.objects.filter(
        status='CLAIMED',
        created_at__lt=cutoff
    ).select_related('donation', 'ngo', 'ngo__user', 'donation__donor')

    released_count = 0
    for claim in stale_claims:
        donation = claim.donation
        ngo_user = claim.ngo.user
        donor = donation.donor
        ngo_name = claim.ngo.organization_name
        donation_title = donation.title

        # Only release if the donation hasn't expired yet
        if donation.expires_at > timezone.now():
            donation.status = 'AVAILABLE'
            donation.save()
        else:
            donation.status = 'EXPIRED'
            donation.save()

        # Delete the claim so the OneToOneField slot is freed
        claim.delete()

        # Create notifications
        try:
            from core.models import Notification
            Notification.objects.create(
                recipient=donor,
                related_donation_id=donation.id,
                notification_type='HOLD_EXPIRED',
                title='Claim Expired — Food Available Again',
                message=f'The claim on "{donation_title}" by {ngo_name} expired (no pickup within {timeout_minutes} min). Your donation is available again.'
            )
            Notification.objects.create(
                recipient=ngo_user,
                related_donation_id=donation.id,
                notification_type='HOLD_EXPIRED',
                title='Your Claim Has Expired',
                message=f'Your claim on "{donation_title}" has expired because pickup was not completed within {timeout_minutes} minutes.'
            )
        except Exception as e:
            print(f"[TASK] Notification error for claim on donation {donation.id}: {e}")

        released_count += 1

    if released_count:
        print(f"[TASK] Released {released_count} stale claims (>{timeout_minutes}min)")
    return released_count
