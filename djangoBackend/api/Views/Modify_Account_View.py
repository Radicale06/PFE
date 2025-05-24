# views.py
from django.shortcuts import get_object_or_404
from ..models import ChatBot
from ..serializers import ChatBotSerializer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from ..serializers import (
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer
)


class ChatBotDetailView(APIView):
    """
    API view to retrieve, update, or delete a specific chatbot
    Handles GET, PATCH, and DELETE requests
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, chatbot_id):
        """Get chatbot details"""
        try:
            chatbot = get_object_or_404(ChatBot, id=chatbot_id)

            # Check if user owns this chatbot
            if chatbot.creator != request.user:
                return Response({
                    "error": "You don't have permission to view this chatbot"
                }, status=status.HTTP_403_FORBIDDEN)

            serializer = ChatBotSerializer(chatbot)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, chatbot_id):
        """Update chatbot fields"""
        try:
            chatbot = get_object_or_404(ChatBot, id=chatbot_id)

            # Check if user owns this chatbot
            if chatbot.creator != request.user:
                return Response({
                    "error": "You don't have permission to update this chatbot"
                }, status=status.HTTP_403_FORBIDDEN)

            # Use serializer for partial update
            serializer = ChatBotSerializer(chatbot, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()

                # Log what fields were updated
                updated_fields = list(request.data.keys())
                print(f"Updated chatbot '{chatbot.name}' fields: {updated_fields}")

                return Response({
                    "message": "Chatbot updated successfully",
                    "chatbot": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Invalid data",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Error updating chatbot: {str(e)}")
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, chatbot_id):
        """Delete chatbot"""
        try:
            chatbot = get_object_or_404(ChatBot, id=chatbot_id)

            # Check if user owns this chatbot
            if chatbot.creator != request.user:
                return Response({
                    "error": "You don't have permission to delete this chatbot"
                }, status=status.HTTP_403_FORBIDDEN)

            chatbot_name = chatbot.name
            chatbot.delete()

            print(f"Deleted chatbot '{chatbot_name}' (ID: {chatbot_id})")

            return Response({
                "message": f"Chatbot '{chatbot_name}' deleted successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error deleting chatbot: {str(e)}")
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class UserProfileView(APIView):
    """
    Get user profile information
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user's profile data"""
        try:
            user = request.user
            serializer = UserProfileSerializer(user)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Profile data retrieved successfully'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error retrieving profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileUpdateView(APIView):
    """
    Update user profile information
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update current user's profile data"""
        try:
            user = request.user
            serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()

                # Return updated profile data
                updated_serializer = UserProfileSerializer(user)
                return Response({
                    'success': True,
                    'data': updated_serializer.data,
                    'message': 'Profile updated successfully'
                }, status=status.HTTP_200_OK)

            return Response({
                'success': False,
                'errors': serializer.errors,
                'message': 'Validation failed'
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error updating profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChangePasswordView(APIView):
    """
    Change user password
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Change current user's password"""
        try:
            serializer = ChangePasswordSerializer(
                data=request.data,
                context={'request': request}
            )

            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Password changed successfully'
                }, status=status.HTTP_200_OK)

            return Response({
                'success': False,
                'errors': serializer.errors,
                'message': 'Password change failed'
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error changing password: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Get user profile information - Function-based view"""
    try:
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Profile data retrieved successfully'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error retrieving profile: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """Update user profile information - Function-based view"""
    try:
        user = request.user
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()

            # Return updated profile data
            updated_serializer = UserProfileSerializer(user)
            return Response({
                'success': True,
                'data': updated_serializer.data,
                'message': 'Profile updated successfully'
            }, status=status.HTTP_200_OK)

        return Response({
            'success': False,
            'errors': serializer.errors,
            'message': 'Validation failed'
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error updating profile: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_user_password(request):
    """Change user password - Function-based view"""
    try:
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)

        return Response({
            'success': False,
            'errors': serializer.errors,
            'message': 'Password change failed'
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error changing password: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)