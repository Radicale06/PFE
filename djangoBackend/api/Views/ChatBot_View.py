from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models import ChatBot
from ..serializers import ChatBotSerializer, ChatBotUserSerializer

class ChatBotCreateView(generics.CreateAPIView):
    queryset = ChatBot.objects.all()
    serializer_class = ChatBotSerializer
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can create chatbots

    def perform_create(self, serializer):
        """Set the creator to the logged-in user."""
        serializer.save(creator=self.request.user)

class UserChatBotsView(generics.ListAPIView):
    serializer_class = ChatBotUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return chatbots created by the logged-in user"""
        return ChatBot.objects.filter(creator=self.request.user)


class DeployedChatBotsView(generics.ListAPIView):
    serializer_class = ChatBotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return chatbots deployed by the logged-in user"""
        return ChatBot.objects.filter(creator=self.request.user, is_deployed=True)

