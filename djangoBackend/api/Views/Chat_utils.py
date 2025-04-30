from django.core.cache import cache
import requests
import re
from ..models import History

def get_chat_history(session_id):
    history_key = f"chat_history_{session_id}"
    history = cache.get(history_key, [])
    return "\n".join(history)


def dump_chat_history(chatbot, question, response):
    History(chatbot=chatbot, question=question, response=response).save()

def update_chat_history(session_id, user_input, bot_response):
    history_key = f"chat_history_{session_id}"
    history = cache.get(history_key, [])

    history.append(f"User: {user_input}")
    history.append(f"Bot: {bot_response}")

    # Trim to last 10 entries
    history = history[-10:]

    cache.set(history_key, history, timeout=3600)  # 1 hour expiry


def clean_deepseek_response(response):
    # Remove the entire <think>...</think> block (including content)
    cleaned = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL)
    # Remove extra whitespace and leading/trailing junk
    cleaned = cleaned.strip()
    # Remove any leftover ">>>" prompts (if present)
    cleaned = re.sub(r'^>>>\s*', '', cleaned)
    return cleaned


def query_deepseek(prompt):
    url = "http://localhost:11434/api/generate"
    headers = {"Content-Type": "application/json"}
    data = {
        "model": "deepseek-r1:7b",
        "prompt": prompt,
        "stream": False
    }
    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        return response.json().get("response", "No response generated.")
    else:
        return f"Error querying DeepSeek: {response.text}"


def query_qwen2_5_7b(prompt):
    url = "http://localhost:11500/api/generate"
    headers = {"Content-Type": "application/json"}
    data = {
        "model": "qwen2.5:7b",
        "prompt": prompt,
        "stream": False
    }
    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        return response.json().get("response", "No response generated.")
    else:
        return f"Error querying qwen2.5:7b: {response.text}"

