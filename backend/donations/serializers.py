from rest_framework import serializers
from .models import Donation, DonationPhoto

class DonationPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationPhoto
        fields = ['id', 'photo']

class DonationSerializer(serializers.ModelSerializer):
    photos = DonationPhotoSerializer(many=True, read_only=True)
    distance_km = serializers.FloatField(read_only=True)
    donor_name = serializers.CharField(source='donor.full_name', read_only=True)
    location_lat = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    location_lng = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    claim_id = serializers.IntegerField(source='claim.id', read_only=True)
    
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ['donor', 'status', 'expires_at', 'created_at']
