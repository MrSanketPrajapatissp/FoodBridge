import hmac
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from core.views import send_email_async
from core.email_utils import send_email_logged, send_contact_exchange_email
from .models import Donation, Claim
from .serializers_claims import ClaimSerializer
from core.models import Organization, Notification
from .utils import haversine_distance

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_create(request):
    """
    NGO claims a donation.
    - Distance check: block if donation is outside NGO's service radius
    - Creates Claim record with OTP
    - Sends contact exchange emails to both donor and NGO
    """
    if request.user.role != 'NGO':
        return Response({'error': 'NGO only'}, status=403)
    
    org = get_object_or_404(Organization, user=request.user)
    if org.verification_status != 'VERIFIED':
        return Response({'error': 'Only verified NGOs can claim food.'}, status=400)

    donation_id = request.data.get('donation_id')
    donation = get_object_or_404(Donation, id=donation_id, status='AVAILABLE')
    
    # ---- DISTANCE CHECK ----
    if donation.location_lat and donation.location_lng and org.location_lat and org.location_lng:
        distance = haversine_distance(
            org.location_lat, org.location_lng,
            donation.location_lat, donation.location_lng
        )
        if distance is not None and distance > org.service_radius_km:
            return Response({
                'error': f'This donation is {distance} km away from your organization. '
                         f'You can only claim food within your {org.service_radius_km} km service radius. '
                         f'Please look for donations closer to your area.',
                'distance_km': distance,
                'service_radius_km': org.service_radius_km,
                'type': 'distance_exceeded'
            }, status=400)
    
    if Claim.objects.filter(donation=donation).exists():
        return Response({'error': 'Already claimed'}, status=400)

    claim = Claim.objects.create(donation=donation, ngo=org)
    donation.status = 'CLAIMED'
    donation.save()
    
    # Calculate distance for response
    distance_km = None
    if donation.location_lat and donation.location_lng and org.location_lat and org.location_lng:
        distance_km = haversine_distance(
            org.location_lat, org.location_lng,
            donation.location_lat, donation.location_lng
        )

    # ---- Get contact info for both parties ----
    donor = donation.donor
    ngo_user = request.user

    donor_phone = donor.phone_number or 'Not provided'
    donor_email = donor.email
    donor_name  = donor.full_name

    ngo_phone = ngo_user.phone_number or 'Not provided'
    ngo_email = ngo_user.email
    ngo_name  = org.organization_name
    
    # ---- NOTIFICATION to donor ----
    Notification.objects.create(
        recipient=donor,
        related_donation_id=donation.id,
        notification_type='DONATION_CLAIMED',
        title='Donation Claimed',
        message=f'Your donation "{donation.title}" has been claimed by {ngo_name}. '
                f'Contact: {ngo_phone} | {ngo_email}'
    )
    
    # ---- CONTACT EXCHANGE EMAIL to NGO (includes OTP + donor contact) ----
    send_email_async(
        send_contact_exchange_email,
        to_email=ngo_email, to_name=ngo_name, role='NGO',
        food_title=donation.title, otp_code=claim.otp_code,
        other_name=donor_name, other_phone=donor_phone, other_email=donor_email,
        pickup_address=donation.pickup_address, distance_km=distance_km
    )

    # ---- CONTACT EXCHANGE EMAIL to Donor (includes NGO contact) ----
    send_email_async(
        send_contact_exchange_email,
        to_email=donor_email, to_name=donor_name, role='DONOR',
        food_title=donation.title, otp_code=claim.otp_code,
        other_name=ngo_name, other_phone=ngo_phone, other_email=ngo_email,
        pickup_address=donation.pickup_address, distance_km=distance_km
    )

    response_data = ClaimSerializer(claim).data
    response_data['distance_km'] = distance_km
    return Response(response_data, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_claims(request):
    """
    Returns all claims for the logged-in NGO.
    Enriched with: distance_km, donation coordinates, donor contact info.
    """
    if request.user.role != 'NGO':
        return Response({'error': 'NGO only'}, status=403)
    org = get_object_or_404(Organization, user=request.user)
    claims = Claim.objects.filter(ngo=org).select_related(
        'donation', 'donation__donor', 'ngo'
    ).order_by('-created_at')
    
    result = []
    for claim in claims:
        data = ClaimSerializer(claim).data
        d = claim.donation
        donor = d.donor
        
        # Distance from NGO to donation pickup
        distance_km = None
        if d.location_lat and d.location_lng and org.location_lat and org.location_lng:
            distance_km = haversine_distance(
                org.location_lat, org.location_lng,
                d.location_lat, d.location_lng
            )
        
        data['distance_km'] = distance_km
        data['donation_lat'] = str(d.location_lat) if d.location_lat else None
        data['donation_lng'] = str(d.location_lng) if d.location_lng else None
        data['donation_address'] = d.pickup_address
        data['ngo_lat'] = str(org.location_lat) if org.location_lat else None
        data['ngo_lng'] = str(org.location_lng) if org.location_lng else None
        data['ngo_name'] = org.organization_name

        # Donor contact info (visible to NGO for coordination)
        data['donor_name'] = donor.full_name
        data['donor_phone'] = donor.phone_number or 'Not provided'
        data['donor_email'] = donor.email

        result.append(data)
    
    return Response(result)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_otp(request, pk):
    """
    Donor enters the OTP to confirm pickup.
    """
    claim = get_object_or_404(Claim, id=pk)
    if claim.donation.donor != request.user:
        return Response({'error': 'Unauthorized'}, status=403)
    
    otp = request.data.get('otp')
    if claim.otp_code == otp:
        claim.status = 'PICKED_UP'
        claim.save()
        
        donation = claim.donation
        donation.status = 'PICKED_UP'
        donation.save()
        
        # Notification for donor
        Notification.objects.create(
            recipient=donation.donor,
            related_donation_id=donation.id,
            notification_type='PICKUP_COMPLETE',
            title='Pickup Complete',
            message=f'The pickup for {donation.title} was completed successfully.'
        )
        
        # Email to donor
        send_email_async(
            send_email_logged,
            request.user.email,
            'Pickup Complete',
            f'The NGO {claim.ngo.organization_name} has successfully picked up your donation: {donation.title}. Thank you for your contribution!'
        )
        return Response({'message': 'OTP Verified. Pickup complete.'})
    return Response({'error': 'Invalid OTP'}, status=400)
