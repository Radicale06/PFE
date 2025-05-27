from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models import ChatBot
from ..serializers import ChatBotSerializer, ChatBotUserSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models import ChatBot
from ..serializers import ChatBotSerializer
from .Templating_View import DEFAULT_PROMPT_FR, DEFAULT_PROMPT_AR, DEFAULT_PROMPT_EN


class ChatBotCreateView(generics.CreateAPIView):
    queryset = ChatBot.objects.all()
    serializer_class = ChatBotSerializer
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can create chatbots

    def get_default_prompt(self, language):
        """Get default COSTAR prompt based on chatbot language"""
        language_prompts = {
            'English': DEFAULT_PROMPT_EN,
            'French': DEFAULT_PROMPT_FR,
            'Arabic': DEFAULT_PROMPT_AR
        }
        return language_prompts.get(language, DEFAULT_PROMPT_EN)  # Default to English if language not found

    def perform_create(self, serializer):
        """Set the creator to the logged-in user and apply default prompt based on language."""
        # Get the language from the serializer's validated data
        chatbot_language = serializer.validated_data.get('language', 'English')

        # Get the appropriate default prompt
        company_name = serializer.validated_data.get('company_name')
        default_prompt = self.get_default_prompt(chatbot_language)
        filled_prompt = default_prompt.format(
            company_name=serializer.validated_data.get('company_name'),
            domain=serializer.validated_data.get('domain'),
            language=serializer.validated_data.get('language'),
            style=serializer.validated_data.get('style')
        )

        # Save the chatbot with the creator and default prompt
        chatbot = serializer.save(
            creator=self.request.user,
            system_prompt=filled_prompt  # Set the default prompt based on language
        )

        print(f"Created chatbot '{chatbot.name}' with language '{chatbot_language}' and default COSTAR prompt")

        return chatbot

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

