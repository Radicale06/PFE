# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
import traceback

# Import your models (adjust the import path according to your app structure)
from ..models import ChatBot, Document

# Import your database handling functions
from ..Services.handle_dbs import (
    get_dataframe_from_db,
    save_dataframe_as_csv
)


class DatabaseConnectionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Extract data from request
            chatbot_id = request.data.get('chatbot_id')
            db_type = request.data.get('db_type')
            credentials = request.data.get('credentials', {})
            # Validate required fields
            if not chatbot_id:
                print("ERROR: Missing chatbot_id")
                return Response({
                    "error": "Missing chatbot_id"
                }, status=status.HTTP_400_BAD_REQUEST)

            if not db_type:
                print("ERROR: Missing db_type")
                return Response({
                    "error": "Missing db_type"
                }, status=status.HTTP_400_BAD_REQUEST)

            if not credentials:
                print("ERROR: Missing credentials")
                return Response({
                    "error": "Missing credentials"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get chatbot instance
            try:
                chatbot = get_object_or_404(ChatBot, id=chatbot_id)
            except Exception as e:
                return Response({
                    "error": f"Chatbot not found: {str(e)}"
                }, status=status.HTTP_404_NOT_FOUND)

            # Validate table_name is provided
            table_name = credentials.get('table_name')
            if not table_name:
                return Response({
                    "error": "Table name is required in credentials"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Connect to database and fetch data using your imported functions
            df = get_dataframe_from_db(db_type, credentials)

            if df is None:
                return Response({
                    "error": "Failed to connect to database or fetch data"
                }, status=status.HTTP_400_BAD_REQUEST)

            if df.empty:
                return Response({
                    "error": f"No data found in table '{table_name}'"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Save data as CSV file
            filename = save_dataframe_as_csv(df, chatbot, db_type, table_name)

            # Create Document record
            document = Document.objects.create(
                chatbot=chatbot,
                type='.csv',
                file=filename
            )

            return Response({
                "message": f"Successfully connected to {db_type} and imported {len(df)} rows from table '{table_name}'",
                "document_id": document.id,
                "rows_imported": len(df),
                "columns": list(df.columns),
                "filename": filename
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)