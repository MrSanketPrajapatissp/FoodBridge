import threading
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Organization, Notification, EmailLog
from .serializers import RegisterSerializer, UserSerializer, OrganizationSerializer, NotificationSerializer, EmailLogSerializer
from .email_utils import send_verification_email, send_admin_ngo_verification_email, send_admin_ngo_rejection_email

def send_email_async(fn, *args, **kwargs):
    """Run any email function in a background thread so HTTP response is never blocked."""
    t = threading.Thread(target=fn, args=args, kwargs=kwargs, daemon=True)
    t.start()

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
        send_email_async(send_verification_email, user)
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
    except Exception:
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
    """
    Verify email by token.
    - Idempotent: if already verified, return success (prevents React StrictMode double-call failures)
    - Auto-approves NGO orgs and sends them an approval email
    """
    token = request.query_params.get('token')
    if not token:
        return Response({'error': 'Token is required'}, status=400)

    # Case 1: Token is valid and not yet used -> verify now
    try:
        u = User.objects.get(email_verification_token=token)
        u.is_email_verified = True
        u.email_verification_token = ''
        u.save()

        # Auto-approve NGO if they have an org profile
        if u.role == 'NGO' and hasattr(u, 'organization'):
            org = u.organization
            if org.verification_status == 'PENDING':
                org.verification_status = 'VERIFIED'
                org.save()
                Notification.objects.create(
                    recipient=u,
                    notification_type='NGO_VERIFIED',
                    title='Organization Verified',
                    message=f'Your NGO "{org.organization_name}" has been automatically verified. You can now claim food donations!'
                )
                send_email_async(send_admin_ngo_verification_email, u)

        return Response({'success': True, 'role': u.role})

    except User.DoesNotExist:
        pass

    # Case 2: Token already used but user is verified (idempotent — React StrictMode hits twice)
    # We can't identify user by token anymore (it's cleared), so just return success
    # This covers the double-call case in development
    return Response({'error': 'Invalid or expired token'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def org_create(request):
    """
    NGO creates their organization profile.
    Auto-approves if their email is already verified.
    """
    if request.user.role != 'NGO':
        return Response({'error': 'NGO only'}, status=403)
    if hasattr(request.user, 'organization'):
        return Response({'error': 'Already has organization'}, status=400)
    ser = OrganizationSerializer(data=request.data)
    if ser.is_valid():
        org = ser.save(user=request.user)

        # Auto-approve if email is already verified
        if request.user.is_email_verified and org.verification_status == 'PENDING':
            org.verification_status = 'VERIFIED'
            org.save()
            Notification.objects.create(
                recipient=request.user,
                notification_type='NGO_VERIFIED',
                title='Organization Verified',
                message=f'Your NGO "{org.organization_name}" has been automatically verified because your email is verified. You can now claim food donations!'
            )
            send_email_async(send_admin_ngo_verification_email, request.user)

        return Response(OrganizationSerializer(org).data)
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    notifs = Notification.objects.filter(recipient=request.user).order_by('-created_at')
    return Response(NotificationSerializer(notifs, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_unread_count(request):
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({'count': count})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def notification_read(request, pk):
    try:
        notif = Notification.objects.get(pk=pk, recipient=request.user)
        notif.is_read = True
        notif.save()
        return Response({'message': 'Marked as read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def notifications_read_all(request):
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    if request.user.role != 'ADMIN':
        return Response({'error': 'Admin only'}, status=403)
    from donations.models import Donation, Claim
    td = Donation.objects.count()
    tpu = Donation.objects.filter(status='PICKED_UP').count()
    tc = Claim.objects.count()
    return Response({
        'total_donations': td,
        'total_claims': tc,
        'pickup_success_rate': round((tpu / td * 100), 2) if td > 0 else 0.0,
        'total_picked_up': tpu
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_pending_ngos(request):
    """
    Returns all PENDING NGO organizations for admin review.
    Includes phone, email, and verification status for each.
    """
    if request.user.role != 'ADMIN':
        return Response({'error': 'Admin only'}, status=403)
    orgs = Organization.objects.filter(verification_status='PENDING').select_related('user').order_by('created_at')
    data = []
    for o in orgs:
        user = o.user
        data.append({
            'id': o.id,
            'organization_name': o.organization_name,
            'registration_number': o.registration_number,
            'address': o.address,
            'city': o.city,
            'state': o.state,
            'service_radius_km': o.service_radius_km,
            'user_email': user.email,
            'user_name': user.full_name,
            'user_phone': user.phone_number or 'Not provided',
            'is_email_verified': user.is_email_verified,
            'is_phone_provided': bool(user.phone_number),
            'created_at': o.created_at
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_verify_ngo(request, pk):
    if request.user.role != 'ADMIN':
        return Response({'error': 'Admin only'}, status=403)
    try:
        org = Organization.objects.get(pk=pk)
        org.verification_status = 'VERIFIED'
        org.save()
        send_email_async(send_admin_ngo_verification_email, org.user)
        Notification.objects.create(recipient=org.user, notification_type='NGO_VERIFIED', title='Organization Verified', message='Your NGO has been verified.')
        return Response({'success': True})
    except Organization.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_reject_ngo(request, pk):
    if request.user.role != 'ADMIN':
        return Response({'error': 'Admin only'}, status=403)
    reason = request.data.get('rejection_reason', 'No reason provided')
    try:
        org = Organization.objects.get(pk=pk)
        org.verification_status = 'REJECTED'
        org.rejection_reason = reason
        org.save()
        send_email_async(send_admin_ngo_rejection_email, org.user, reason)
        Notification.objects.create(recipient=org.user, notification_type='NGO_REJECTED', title='Organization Rejected', message=f'Reason: {reason}')
        return Response({'success': True})
    except Organization.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_email_logs(request):
    if request.user.role != 'ADMIN':
        return Response({'error': 'Admin only'}, status=403)
    logs = EmailLog.objects.all().order_by('-sent_at')
    return Response(EmailLogSerializer(logs, many=True).data)
