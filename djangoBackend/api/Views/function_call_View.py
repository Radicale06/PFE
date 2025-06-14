import json
import uuid
import os
import logging
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.cache import cache
from django.contrib.auth import get_user_model
from ..models import ChatBot
from .Templating_View import DEFAULT_PROMPT_FR,DEFAULT_PROMPT_EN,DEFAULT_PROMPT_AR
from dotenv import load_dotenv
load_dotenv()


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Mistral API details
API_URL = os.getenv('MISTRAL_API')
MODEL = "mistralai/Mistral-Small-24B-Instruct-2501"

User = get_user_model()



class ChatbotCreatorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Get data from request
        user = request.user
        print(user)
        data = request.data
        message = data.get("message", "").strip()
        session_id = data.get("session_id")

        # Get conversation history from cache
        conversation_key = f"chatbot_creator_{session_id}"
        print(conversation_key)
        conversation_history = cache.get(conversation_key, [])
        print(conversation_history)

        # First interaction - send greeting
        if not message:
            greeting = (
                "Hi! I'm your Chatbot Creator Assistant. "
                "I'll help you create a custom chatbot by collecting some specifications. "
                "Would you like to create a chatbot today?"
            )
            conversation_history.append({"role": "assistant", "content": greeting})
            cache.set(conversation_key, conversation_history, timeout=3000)
            return Response({"message": greeting})

        # Add user message to history
        conversation_history.append({"role": "user", "content": message})

        # Create the system prompt
        system_prompt = (
            "You are a specialized AI assistant designed to help users create chatbots. "
            "First, confirm if the user wants to create a chatbot. "
            "Then, collect these specifications one at a time in a friendly, conversational way:\n"
            "1. Name: What to call the chatbot?\n"
            "2. Company Name: What is the company for which the chatbot will be working?\n"
            "3. Domain: What topic the chatbot should specialize in?\n"
            "4. Language: What language the chatbot should use (English, French, or Arabic)?\n"
            "5. Style: What communication style the chatbot should use (formal, casual, friendly, technical)?\n\n"
            "You can ask the questions in your way. Once you have all specifications, summarize them and ask for confirmation. "
            "If the user confirms, output a function call in this format:\n"
            "```json\n"
            "{\n"
            '  "function": "create_chatbot",\n'
            '  "parameters": {\n'
            '    "name": "chatbot name",\n'
            '    "company_name": "company name",\n'
            '    "domain": "chatbot domain",\n'
            '    "language": "chatbot language",\n'
            '    "style": "chatbot style"\n'
            "  }\n"
            "}\n"
            "```\n\n"
            "Stay focused on chatbot creation only."
        )

        # Prepare messages for the API
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        for msg in conversation_history:
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Prepare payload with function calling
        payload = {
            "model": MODEL,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 800,
            "tools": [
                {
                    "type": "function",
                    "function": {
                        "name": "create_chatbot",
                        "description": "Create a new chatbot with the specified parameters",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "description": "The name of the chatbot"
                                },
                                "company_name": {
                                    "type": "string",
                                    "description": "The name of the company for which the chatbot will be working"
                                },
                                "domain": {
                                    "type": "string",
                                    "description": "The domain or topic the chatbot specializes in"
                                },
                                "language": {
                                    "type": "string",
                                    "description": "The language the chatbot will use (English, French, or Arabic)"
                                },
                                "style": {
                                    "type": "string",
                                    "description": "The communication style of the chatbot (formal, casual, friendly, technical)"
                                }
                            },
                            "required": ["name", "company_name", "domain", "language", "style"]
                        }
                    }
                }
            ]
        }

        # Make API request
        try:
            logger.debug(f"Sending request to API: {payload}")
            response = requests.post(
                API_URL,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=30
            )

            if response.status_code != 200:
                logger.error(f"API error {response.status_code}: {response.text}")
                return Response({"session_id": session_id, "message": "Error contacting model API."})

            data = response.json()
            logger.debug(f"API response: {data}")

            # Extract message content and tool calls
            response_message = data.get("choices", [{}])[0].get("message", {})

            # Handle content (which might be None when function is called)
            content = response_message.get("content")
            message_to_return = ""

            # Extract tool calls
            tool_calls = response_message.get("tool_calls", [])
            function_called = False
            chatbot_data = None
            created_chatbot = None

            # Check for function call in tool_calls
            if tool_calls:
                for tool_call in tool_calls:
                    if tool_call.get("type") == "function" and tool_call.get("function", {}).get(
                            "name") == "create_chatbot":
                        try:
                            arguments = json.loads(tool_call.get("function", {}).get("arguments", "{}"))
                            if all(key in arguments for key in ["name", "company_name", "domain", "language", "style"]):
                                function_called = True
                                chatbot_data = arguments

                                # Create the chatbot directly in the database
                                created_chatbot = self._create_chatbot(chatbot_data, user)

                                # Create a message to return to the user
                                message_to_return = (
                                    f"Great! I've created your chatbot with these specifications:\n"
                                    f"• Name: {arguments.get('name')}\n"
                                    f"• Company Name: {arguments.get('company_name')}\n"
                                    f"• Domain: {arguments.get('domain')}\n"
                                    f"• Language: {arguments.get('language')}\n"
                                    f"• Style: {arguments.get('style')}\n\n"
                                    f"Your chatbot has been created successfully!"
                                )
                        except Exception as e:
                            logger.error(f"Failed to create chatbot: {str(e)}")
                            message_to_return = f"Error creating chatbot: {str(e)}"

            # If no function call but we have content, use that
            if not function_called and content:
                message_to_return = content

            # Add to conversation history if we have a message
            if message_to_return:
                conversation_history.append({"role": "assistant", "content": message_to_return})
                cache.set(conversation_key, conversation_history, timeout=3600)

            # Return response
            response_data = {
                "session_id": session_id,
                "message": message_to_return,
                "function_called": function_called
            }

            if created_chatbot:
                response_data["chatbot"] = {
                    "id": str(created_chatbot.id),
                    "name": created_chatbot.name,
                    "company_name": created_chatbot.company_name,
                    "domain": created_chatbot.domain,
                    "language": created_chatbot.language,
                    "style": created_chatbot.style
                }

            return Response(response_data)

        except Exception as e:
            logger.error(f"Exception: {str(e)}")
            return Response({"session_id": session_id, "message": f"Unexpected error occurred: {str(e)}"})

    def _create_chatbot(self, chatbot_data, user):
        print(f"User: {user}")
        print(f"Chatbot data: {chatbot_data}")

        try:
            # Extract fields with validation
            name = chatbot_data.get('name')
            domain = chatbot_data.get('domain')
            language = chatbot_data.get('language')
            style = chatbot_data.get('style')
            company_name = chatbot_data.get('company_name')

            print(
                f"Fields - Name: '{name}', Domain: '{domain}', Language: '{language}', Style: '{style}', Company: '{company_name}'")

            # Check if any field is None or empty
            if not name:
                raise Exception("Name is required")
            if not domain:
                raise Exception("Domain is required")
            if not language:
                raise Exception("Language is required")
            if not style:
                raise Exception("Style is required")
            if not company_name:
                raise Exception("Company name is required")

            # Get language prompt
            language_prompts = {
                'English': DEFAULT_PROMPT_EN,
                'French': DEFAULT_PROMPT_FR,
                'Arabic': DEFAULT_PROMPT_AR
            }
            system_prompt = language_prompts.get(language, DEFAULT_PROMPT_EN)

            if not system_prompt:
                raise Exception(f"No prompt template found for language: {language}")

            try:
                final_prompt = system_prompt.format(company_name=company_name, domain=domain, language=language, style=style )
            except Exception as format_error:
                print(f"Error formatting prompt: {format_error}")
                final_prompt = system_prompt  # Use unformatted as fallback

            print(f"Creating chatbot with user: {user}, user.id: {user.id}")

            # Create chatbot
            chatbot = ChatBot(
                name=name,
                domain=domain,
                language=language,
                style=style,
                company_name=company_name,
                system_prompt=final_prompt,
                creator=user
            )

            print(f"ChatBot object created, attempting to save...")
            chatbot.full_clean()  # Validate before saving
            chatbot.save()

            logger.info(f"Chatbot created successfully with ID: {chatbot.id}")
            return chatbot

        except Exception as e:
            import traceback
            full_error = traceback.format_exc()
            logger.error(f"Full error traceback: {full_error}")
            print(f"Full error traceback: {full_error}")
            raise Exception(f"Failed to create chatbot: {str(e)}")