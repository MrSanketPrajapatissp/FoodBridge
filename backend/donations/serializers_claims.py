from rest_framework import serializers
from .models import Claim, Donation
from core.serializers import OrganizationSerializer

class ClaimSerializer(serializers.ModelSerializer):
    ngo_details = OrganizationSerializer(source='ngo', read_only=True)
    donation_title = serializers.CharField(source='donation.title', read_only=True)
    
    class Meta:
        model = Claim
        fields = '__all__'
        read_only_fields = ['ngo', 'otp_code', 'status', 'created_at']
