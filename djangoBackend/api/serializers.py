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

class ChatBotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatBot
        fields = ['id', 'name', 'domain', 'language', 'style', 'created_at']  # Exclude 'creator'
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
        fields = ['id', 'name', 'domain', 'language', 'style', 'created_at', 'is_deployed']  # Exclude 'creator'
        read_only_fields = ['id', 'created_at']

