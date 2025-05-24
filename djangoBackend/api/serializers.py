from django.contrib.auth.models import User
from rest_framework import serializers
from .models import ChatBot, Document
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2','first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )

        user.set_password(validated_data['password'])
        user.save()

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for retrieving user profile data"""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile information"""

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name']

    def validate_email(self, value):
        """Validate email uniqueness"""
        user = self.instance
        if user and User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_first_name(self, value):
        """Validate first name is not empty"""
        if not value.strip():
            raise serializers.ValidationError("First name cannot be empty.")
        return value.strip()

    def validate_last_name(self, value):
        """Validate last name is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Last name cannot be empty.")
        return value.strip()


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        """Validate that the old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate_new_password(self, value):
        """Validate new password using Django's password validators"""
        validate_password(value)
        return value

    def save(self, **kwargs):
        """Save the new password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class ChatBotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatBot
        fields = ['id', 'name', 'company_name', 'domain', 'language', 'style', 'created_at']  # Exclude 'creator'
        read_only_fields = ['id', 'created_at']  # These fields should not be modified by the user

    def validate_name(self, value):
        """Ensure the chatbot name is unique per user."""
        user = self.context['request'].user  # Get the logged-in user
        if ChatBot.objects.filter(name=value, creator=user).exists():
            raise serializers.ValidationError("You already have a chatbot with this name.")
        return value


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id','chatbot', 'type', 'file', 'uploaded_at']
        read_only_fields = ['id', 'chatbot', 'uploaded_at']

class ChatBotUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatBot
        fields = ['id', 'name', 'domain', 'company_name', 'style', 'language', 'system_prompt', 'is_deployed']  # Exclude 'creator'
        read_only_fields = ['id', 'created_at']

