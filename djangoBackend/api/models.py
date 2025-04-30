from django.db import models
from django.contrib.auth.models import User
import uuid
import secrets
class ChatBot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    domain = models.TextField()
    language = models.TextField()
    style = models.TextField()
    system_prompt = models.TextField(blank=True)
    is_deployed = models.BooleanField(default=False)
    token = models.CharField(max_length=64, unique=True, blank=True ,null=True)
    api_url = models.CharField(max_length=64, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bots")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name', 'creator'], name='unique_bot_name_per_user')
        ]

    def __str__(self):
        return self.name


def chatbot_directory_path(instance, filename):
    return f'chatbots/{instance.chatbot.id}/{filename}'
class Document(models.Model):
    chatbot = models.ForeignKey(ChatBot, on_delete=models.CASCADE, related_name="documents")
    type = models.CharField(max_length=10)  # "excel" "PDF", "scrapped"
    file = models.FileField(upload_to=chatbot_directory_path, null=True)  # Store file in chatbot-specific folder
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type}"


class History(models.Model):
    chatbot = models.ForeignKey(ChatBot, on_delete=models.CASCADE, related_name="history")
    TimeStamp = models.DateTimeField(auto_now_add=True)
    question = models.TextField()
    response = models.TextField()

