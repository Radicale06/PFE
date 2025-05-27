from rest_framework.views import APIView
from django.http import JsonResponse
from ..models import ChatBot
from django.shortcuts import get_object_or_404
from ..Views.chroma_utils import get_doc_from_chroma
from .Chat_utils import *
import json
import re

class PublicChatBotQueryView(APIView):
    """
    Public API to interact with a deployed chatbot using token-based access.
    No user authentication required.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request, api_url):
        try:
            data = json.loads(request.body)

            message = data.get("message")
            session_id = data.get("session_id")
            token = data.get("token")

            if not all([message, session_id, token]):
                return JsonResponse({"error": "Missing required fields."}, status=400)

            try:
                chatbot = ChatBot.objects.get(api_url=api_url, token=token)
            except ChatBot.DoesNotExist:
                return JsonResponse({"error": "Invalid token or url."}, status=403)
            if not chatbot.is_deployed:

                return JsonResponse({"error": "Chatbot is not deployed."}, status=403)

            # Get relevant context
            doc_result = get_doc_from_chroma(message, str(chatbot.id))

            context = doc_result["documents"][0] if doc_result["documents"] else "No relevant context found."

            # Get history
            chat_history = get_chat_history(session_id)

            if chatbot.language == "English":
                prompt_template = chatbot.system_prompt
                prompt_template + "/n" + """**KNOWLEDGE BASE CONTEXT:**
                {context}
                **CONVERSATION HISTORY:**
                {chat_history}
                **CUSTOMER QUERY:**
                {query}"""
            elif chatbot.language == "French":
                prompt_template = chatbot.system_prompt
                prompt_template + "/n" + """**CONTEXTE DE LA BASE DE CONNAISSANCES:**
                {context}
                **HISTORIQUE DE CONVERSATION:**
                {chat_history}
                **QUESTION DU CLIENT:**
                {query}"""
            else:  # Arabic
                prompt_template = chatbot.system_prompt
                prompt_template + "/n" + """**سياق قاعدة المعرفة:**
                {context}
                **تاريخ المحادثة:**
                {chat_history}
                **استفسار العميل:**
                {query}"""

            # Apply the COSTAR structured prompt
            final_prompt = prompt_template.format(
                chat_history=chat_history,
                context=context,
                query=message
            )

            response = query_model_by_language(final_prompt, chatbot.language)

            update_chat_history(session_id, message, response)
            dump_chat_history(chatbot, message, response)

            return JsonResponse({"response": response})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
