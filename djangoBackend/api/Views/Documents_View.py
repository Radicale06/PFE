import pandas as pd
import os
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from ..models import Document, ChatBot
from ..serializers import DocumentSerializer
from ..Services.handle_excel import handle_excel
from ..Services.handle_pdf import handlePDF


class DocumentCreateView(generics.CreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser)  # Enable file upload parsing

    def create(self, request, *args, **kwargs):
        """Saving in DB Stage"""
        chatbot_id = request.data.get("chatbot")  # Ensure chatbot_id is provided
        file = request.FILES.get("file")  # Get uploaded file
        file_name, file_extension = os.path.splitext(file.name)
        file_extension = file_extension.lower()

        """Vector DB Handling"""
        try:
            if file_extension in [".xls", ".xlsx", ".csv"]:
                if file_extension == ".csv":
                    df = pd.read_csv(file)
                else:
                    df = pd.read_excel(file)
                handle_excel(df, chatbot_id, file.name)
            elif file_extension == ".pdf":
                handlePDF(chatbot_id, file.name, file)

            else:
                return Response({"error": "Unsupported file format."},
                status=status.HTTP_400_BAD_REQUEST)

                # Process the file content and store it in ChromaDB
            data = request.data.copy()
            data["type"] = file_extension
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                chatbot = get_object_or_404(ChatBot, id=chatbot_id)
                serializer.save(chatbot=chatbot)  # Save with correct attributes

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
