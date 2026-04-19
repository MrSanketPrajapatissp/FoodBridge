from rest_framework import serializers
from .models import User, Organization
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
        fields = ['email', 'password', 'full_name', 'role']
    
    def validate_role(self, value):
        if value == 'ADMIN':
            raise serializers.ValidationError("Cannot register as Admin.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'
        read_only_fields = ['user', 'verification_status', 'rejection_reason', 'created_at']
