import pandas as pd
import os
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from ..models import Document, ChatBot
from ..serializers import DocumentSerializer
import tempfile
from ..Services.tasks import process_uploaded_file


class DocumentCreateView(generics.CreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser)  # Enable file upload parsing

    def create(self, request, *args, **kwargs):
        chatbot_id = request.data.get("chatbot")
        file = request.FILES.get("file")
        file_name, file_extension = os.path.splitext(file.name)
        file_extension = file_extension.lower()

        if file_extension not in [".xls", ".xlsx", ".csv", ".pdf", ".docx", ".txt"]:
            return Response({"error": "Unsupported file format."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            # Save file to temp path
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
                for chunk in file.chunks():
                    temp_file.write(chunk)
                temp_path = temp_file.name

            # Trigger Celery task
            process_uploaded_file.delay(chatbot_id, file.name, temp_path, file_extension)

            # Save metadata
            data = request.data.copy()
            data["type"] = file_extension
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                chatbot = get_object_or_404(ChatBot, id=chatbot_id)
                serializer.save(chatbot=chatbot)
                return Response({
                    "message": "File received. Processing will continue in background.",
                    "data": serializer.data,
                }, status=status.HTTP_202_ACCEPTED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

