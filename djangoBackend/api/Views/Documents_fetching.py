from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import ChatBot, Document
from ..serializers import DocumentSerializer

class ChatbotDocumentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chatbot_id = request.query_params.get("chatbot")
        if not chatbot_id:
            return Response({"error": "Missing chatbot ID."}, status=status.HTTP_400_BAD_REQUEST)

        chatbot = get_object_or_404(ChatBot, id=chatbot_id)

        documents = Document.objects.filter(chatbot=chatbot)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
