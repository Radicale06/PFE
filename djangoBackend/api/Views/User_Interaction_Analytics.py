# views.py
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ..models import ChatBot, History
from collections import defaultdict

class UserInteractionAnalytics(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # Step 1: Get all chatbots created by the user
        chatbots = ChatBot.objects.filter(creator=user)

        if not chatbots.exists():
            return Response({"detail": "No chatbots found for user."}, status=404)

        # Step 2: Gather all history entries for those chatbots
        history_entries = History.objects.filter(chatbot__in=chatbots)

        # Step 3: Group and count interactions by chatbot name and date
        interaction_data = defaultdict(lambda: defaultdict(int))

        for entry in history_entries:
            date = entry.TimeStamp.date().isoformat()
            chatbot_name = entry.chatbot.name
            interaction_data[chatbot_name][date] += 1

        # Step 4: Flatten into list of dicts for the frontend
        formatted_data = []
        for chatbot, date_dict in interaction_data.items():
            for date, count in date_dict.items():
                formatted_data.append({
                    "chatbot": chatbot,
                    "date": date,
                    "interactions": count
                })

        return Response(formatted_data, status=status.HTTP_200_OK)
