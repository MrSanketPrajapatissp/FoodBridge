from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from .models import Donation, Claim
from .serializers_claims import ClaimSerializer
from core.models import Organization

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_create(request):
    if request.user.role != 'NGO':
        return Response({'error': 'NGO only'}, status=403)
    
    org = get_object_or_404(Organization, user=request.user)
    if org.verification_status != 'VERIFIED':
        return Response({'error': 'Only verified NGOs can claim food.'}, status=400)

    donation_id = request.data.get('donation_id')
    donation = get_object_or_404(Donation, id=donation_id, status='AVAILABLE')
    
    if Claim.objects.filter(donation=donation).exists():
        return Response({'error': 'Already claimed'}, status=400)

    claim = Claim.objects.create(donation=donation, ngo=org)
    donation.status = 'CLAIMED'
    donation.save()
    
    # Rule 5: OTP goes to NGO's own email only
    try:
        send_mail(
            'Donation Claimed - Your OTP',
            f'You have claimed {donation.title}. Show this OTP to the donor for pickup: {claim.otp_code}',
            'no-reply@foodbridge.com',
            [request.user.email],
            fail_silently=True
        )
    except: pass

    return Response(ClaimSerializer(claim).data, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_claims(request):
    if request.user.role != 'NGO':
        return Response({'error': 'NGO only'}, status=403)
    org = get_object_or_404(Organization, user=request.user)
    claims = Claim.objects.filter(ngo=org).order_by('-created_at')
    return Response(ClaimSerializer(claims, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_otp(request, pk):
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
        
        # Rule 6: Donor pickup notification
        send_mail(
            'Pickup Complete',
            f'The NGO {claim.ngo.name} has successfully picked up your donation: {donation.title}. Thank you for your contribution!',
            'no-reply@foodbridge.com',
            [request.user.email],
            fail_silently=True
        )
        return Response({'message': 'OTP Verified. Pickup complete.'})
    return Response({'error': 'Invalid OTP'}, status=400)
