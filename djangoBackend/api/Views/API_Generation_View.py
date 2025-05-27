from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models import ChatBot
import uuid
class GenerateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chatbot_id):
        bot = get_object_or_404(ChatBot, id=chatbot_id, creator=request.user)

        if not bot.is_deployed:
            bot.is_deployed = True
            bot.save()
            if not bot.token:
                bot.token = str(uuid.uuid4())  # Generating a unique token
            # Generate api_url if it doesn't exist
            if not bot.api_url:
                bot.api_url = str(uuid.uuid4())  # API endpoint for the chatbot
            bot.save()

        api_url = request.build_absolute_uri(f"/api/{bot.api_url}/query/")
        return Response({
            "chatbot_name": bot.name,
            "api_url": api_url,
            "deployment_token": bot.token
        })
