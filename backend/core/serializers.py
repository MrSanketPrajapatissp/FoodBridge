from rest_framework import serializers
from .models import User, Organization, Notification, EmailLog
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone_number', 'role', 'is_email_verified', 'created_at']
        read_only_fields = ['id', 'is_email_verified', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'phone_number', 'role']
    
    def validate_role(self, value):
        if value == 'ADMIN':
            raise serializers.ValidationError("Cannot register as Admin.")
        return value

    def validate_phone_number(self, value):
        import re
        if not value:
            return value
        cleaned = re.sub(r'\s', '', value)
        if not re.match(r'^[6-9]\d{9}$', cleaned):
            raise serializers.ValidationError("Enter a valid 10-digit mobile number starting with 6-9.")
        return cleaned

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'
        read_only_fields = ['user', 'verification_status', 'rejection_reason', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = '__all__'
