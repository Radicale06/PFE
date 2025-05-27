# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get refresh token from request data (if provided)
            refresh_token = request.data.get("refresh_token")

            if refresh_token:
                # Blacklist the refresh token
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except TokenError:
                    pass  # Token might already be blacklisted or invalid

            return Response({
                "message": "Successfully logged out"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Even if something goes wrong, return success
            # Frontend will clear tokens anyway
            return Response({
                "message": "Logged out"
            }, status=status.HTTP_200_OK)


