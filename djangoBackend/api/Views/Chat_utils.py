from django.core.cache import cache
import requests
import re
import os
from ..models import History
from dotenv import load_dotenv
load_dotenv()

API_URL = os.getenv('MISTRAL_API')
MODEL = "mistralai/Mistral-Small-24B-Instruct-2501"
def get_chat_history(session_id):
    history_key = f"chat_history_{session_id}"
    history = cache.get(history_key, [])
    return "\n".join(history)


def dump_chat_history(chatbot, question, response):
    History(chatbot=chatbot, question=question, response=response).save()


def update_chat_history(session_id, user_input, bot_response):
    history_key = f"chat_history_{session_id}"
    history = cache.get(history_key, [])

    history.append(f"User question: {user_input}")
    history.append(f"Chatbot answer: {bot_response}")

    # Trim to last 10 entries
    history = history[-10:]

    cache.set(history_key, history, timeout=7200)  # 2 hour expiry


def query_mistral(prompt):
    """Query Mistral-Small-24B-Instruct-2501 model via vLLM using OpenAI Chat Completions format"""
    headers = {"Content-Type": "application/json"}

    # Format for OpenAI Chat Completions API
    data = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1000,
        "temperature": 0.7,
    }

    try:
        response = requests.post(API_URL, headers=headers, json=data, timeout=60)

        if response.status_code == 200:
            result = response.json()
            # Extract content from OpenAI Chat Completions format
            if result.get("choices") and len(result["choices"]) > 0:
                message = result["choices"][0].get("message", {})
                return message.get("content", "No response generated.")
            else:
                return "No response generated."
        else:
            return f"Error querying Mistral: {response.status_code} - {response.text}"
    except requests.exceptions.Timeout:
        return "Error: Request timed out. The model may be processing a complex query."


def query_jais(prompt):
    """Query Jais-13B-Chat model for Arabic via vLLM"""
    url = os.getenv('JAIS_13b_API') # Different port for Jais
    headers = {"Content-Type": "application/json"}
    data = {
        "model": "inceptionai/jais-family-13b-chat",
        "prompt": prompt,
        "max_tokens": 1000,
        "temperature": 0.7,
        "top_p": 0.9,
        "stop": ["<|endoftext|>", "</s>"]
    }

    try:
        response = requests.post(url, headers=headers, json=data, timeout=60)

        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["text"] if result.get("choices") else "No response generated."
        else:
            return f"Error querying Jais: {response.status_code} - {response.text}"
    except requests.exceptions.Timeout:
        return "Error: Request timed out. The model may be processing a complex query."
    except requests.exceptions.RequestException as e:
        return f"Error connecting to Jais: {str(e)}"


def query_model_by_language(prompt, language):
    """Route to appropriate model based on language"""
    if language.lower() == "arabic":
        response = query_jais(prompt)
    else:  # English or French
        response = query_mistral(prompt)

    return response