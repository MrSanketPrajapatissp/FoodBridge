from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Organization
from .serializers import RegisterSerializer, UserSerializer, OrganizationSerializer
from .email_utils import send_verification_email

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok'})

@api_view(['GET'])
@permission_classes([AllowAny])
def platform_stats(request):
    from donations.models import Donation, Claim
    return Response({
        'total_donations': Donation.objects.count(),
        'active_donations': Donation.objects.filter(status='AVAILABLE').count(),
        'total_claims': Claim.objects.count(),
        'completed_pickups': Donation.objects.filter(status='PICKED_UP').count(),
        'verified_ngos': Organization.objects.filter(verification_status='VERIFIED').count(),
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    ser = RegisterSerializer(data=request.data)
    if ser.is_valid():
        user = ser.save()
        send_verification_email(user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'redirect_to_org': user.role == 'NGO'
        })
    return Response(ser.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(email=email, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=401)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh = request.data.get('refresh')
        token = RefreshToken(refresh)
        token.blacklist()
        return Response({'success': True})
    except:
        return Response({'error': 'Invalid token'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response(UserSerializer(request.user).data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def profile_update(request):
    user = request.user
    user.full_name = request.data.get('full_name', user.full_name)
    user.phone_number = request.data.get('phone_number', user.phone_number)
    user.save()
    return Response(UserSerializer(user).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request):
    token = request.query_params.get('token')
    try:
        u = User.objects.get(email_verification_token=token)
        u.is_email_verified = True
        u.email_verification_token = ''
        u.save()
        return Response({'success': True})
    except:
        return Response({'error': 'Invalid token'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def org_create(request):
    if request.user.role != 'NGO':
        return Response({'error': 'NGO only'}, status=403)
    if hasattr(request.user, 'organization'):
        return Response({'error': 'Already has organization'}, status=400)
    ser = OrganizationSerializer(data=request.data)
    if ser.is_valid():
        ser.save(user=request.user)
        return Response(ser.data)
    return Response(ser.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def org_my(request):
    if request.user.role != 'NGO' or not hasattr(request.user, 'organization'):
        return Response({'error': 'Not found'}, status=404)
    return Response(OrganizationSerializer(request.user.organization).data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def org_update(request):
    if request.user.role != 'NGO' or not hasattr(request.user, 'organization'):
        return Response({'error': 'Not found'}, status=404)
    ser = OrganizationSerializer(request.user.organization, data=request.data, partial=True)
    if ser.is_valid():
        ser.save()
        return Response(ser.data)
    return Response(ser.errors, status=400)
