from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from .models import Donation, DonationPhoto
from .serializers import DonationSerializer, DonationPhotoSerializer
from .utils import haversine_distance, geocode_address

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def donation_create(request):
    if request.user.role != 'DONOR':
        return Response({'error': 'Donor only'}, status=403)
    
    data = request.data.copy()
    print(f"DEBUG REQ DATA: {data}")
    
    # Auto-geocode if address is present and coords are missing
    address = data.get('pickup_address')
    lat = data.get('location_lat')
    lng = data.get('location_lng')
    
    if address and (not lat or not lng or lat == '' or lng == ''):
        alat, alng = geocode_address(address)
        if alat is not None and alng is not None:
            data['location_lat'] = round(Decimal(str(alat)), 6)
            data['location_lng'] = round(Decimal(str(alng)), 6)
    
    print(f"CLEANED DATA: {data}")
    ser = DonationSerializer(data=data)
    if ser.is_valid():
        donation = ser.save(donor=request.user)
        photos = request.FILES.getlist('photos')
        for p in photos:
            DonationPhoto.objects.create(donation=donation, photo=p)
        print(f"[SUCCESS] Donation created: {donation.id}")
        return Response(DonationSerializer(donation).data)
    print(f"[ERROR] Donation serializer errors: {ser.errors}")
    return Response(ser.errors, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def donation_list(request):
    lat = request.query_params.get('lat')
    lng = request.query_params.get('lng')
    food_type = request.query_params.get('food_type')
    
    qs = Donation.objects.filter(status='AVAILABLE', expires_at__gt=timezone.now())
    if food_type and food_type != 'ALL':
        qs = qs.filter(food_type=food_type)
    
    dons = list(qs)
    for d in dons:
        if lat and lng:
            d.distance_km = haversine_distance(lat, lng, d.location_lat, d.location_lng)
        else:
            d.distance_km = None
            
    if lat and lng:
        dons.sort(key=lambda x: x.distance_km)
        
    return Response(DonationSerializer(dons, many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def donation_detail(request, pk):
    try:
        d = Donation.objects.get(pk=pk)
        return Response(DonationSerializer(d).data)
    except Donation.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def donation_update(request, pk):
    try:
        d = Donation.objects.get(pk=pk, donor=request.user, status='AVAILABLE')
        ser = DonationSerializer(d, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=400)
    except Donation.DoesNotExist:
        return Response({'error': 'Not found or not editable'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def donation_cancel(request, pk):
    try:
        d = Donation.objects.get(pk=pk, donor=request.user, status='AVAILABLE')
        d.status = 'CANCELLED'
        d.save()
        return Response({'success': True})
    except Donation.DoesNotExist:
        return Response({'error': 'Not found or not cancellable'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_donations(request):
    qs = Donation.objects.filter(donor=request.user).order_by('-created_at')
    return Response(DonationSerializer(qs, many=True).data)
