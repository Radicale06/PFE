import json
from ..models import ChatBot
import re
import chromadb
from rest_framework.views import APIView
from .Chat_utils import *
from ..Views.chroma_utils import get_doc_from_chroma
from django.http import JsonResponse


class QueryView(APIView):
    """
    API view to handle chatbot queries with session-based memory using COSTAR prompts.
    Token authentication is required.
    """

    def post(self, request):
        try:
            data = json.loads(request.body)
            query = data.get("message")
            chatbot_id = data.get("chatbot_id")
            session_id = data.get("session_id")  # Unique session identifier
            chatbot = ChatBot.objects.get(id=chatbot_id)


            # Retrieve relevant document from ChromaDB
            doc_result = get_doc_from_chroma(query, chatbot_id)
            context = doc_result["documents"][0] if doc_result["documents"] else "No relevant context found."

            # Retrieve chat history
            chat_history = get_chat_history(session_id)

            # Select prompt template based on language
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
                query=query
            )

            # Query the appropriate model based on language
            model_response = query_model_by_language(final_prompt, chatbot.language)

            # Update chat history
            update_chat_history(session_id, query, model_response)

            # Save to database
            dump_chat_history(chatbot, query, model_response)

            return JsonResponse({"response": model_response})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)