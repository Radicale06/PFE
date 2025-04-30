# views.py
from django.http import JsonResponse
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import History, ChatBot
import pandas as pd


class HistoryChatbot(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Get chatbot_id from the request body
        chatbot_id = request.data.get('chatbot_id')

        if not chatbot_id:
            return Response({"detail": "chatbot_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify the chatbot exists
            chatbot = ChatBot.objects.get(id=chatbot_id)


            # Get all history records and filter in Python
            all_history = History.objects.all()

            # Filter by chatbot_id - convert both to same type (string or int)
            filtered_history = [
                h for h in all_history
                if str(h.chatbot_id) == str(chatbot_id)
            ]

            if not filtered_history:
                return Response({"detail": "No history found for this chatbot."}, status=status.HTTP_404_NOT_FOUND)

            # Prepare data for DataFrame
            history_data = []
            for idx, history in enumerate(filtered_history):
                history_data.append({
                    'id': idx,  # This gives us our reordered ID starting from 0
                    'question': history.question,
                    'response': history.response,
                    'TimeStamp': history.TimeStamp,
                })

            # Create DataFrame
            df = pd.DataFrame(history_data)

            # Convert DataFrame to dictionary for JSON response
            response_data = df.to_dict('records')

            return Response(response_data, status=status.HTTP_200_OK)

        except ChatBot.DoesNotExist:
            return Response({"detail": "Chatbot not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error: {str(e)}")  # Log the error for debugging
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class SeeCredentials(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        chatbot = request.data.get('chatbot_id')
        chatbot = ChatBot.objects.get(id=chatbot)
        if not chatbot:
            return Response({"detail": "there is no chatbot with this id."}, status=status.HTTP_400_BAD_REQUEST)
        token = chatbot.token
        url = request.build_absolute_uri(f"/api/{chatbot.api_url}/query/")

        return JsonResponse({'url': url, 'token': token})

