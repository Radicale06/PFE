from django.urls import path, include
import uuid
from .Views.API_Generation_View import GenerateAPIView
from .Views.User_View import CreateUserView
from .Views.ChatBot_View import ChatBotCreateView, UserChatBotsView, DeployedChatBotsView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .Views.token_view import CustomTokenObtainPairView
from .Views.Documents_View import DocumentCreateView
from .Views.Chat_View import QueryView
from .Views.Public_Genration_View import PublicChatBotQueryView
from .Views.Google_Auth import GoogleLoginView
from .Views.History_View import HistoryChatbot, SeeCredentials
from .Views.UserInterraction import UserInteractionAnalytics


urlpatterns = [
    path('api/user/register/', CreateUserView.as_view(), name='register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls')),
    path("api/google-login/", GoogleLoginView.as_view(), name="google-login"),
    path('api/chatbots/create/', ChatBotCreateView.as_view(), name='chatbot-create'),
    path("api/chatbots/", UserChatBotsView.as_view(), name="user-chatbots"),
    path("api/deployed-chatbots/", DeployedChatBotsView.as_view(), name="user-deployed-chatbots"),
    path("api/upload/", DocumentCreateView.as_view(), name="user-documents"),
    path('api/get-history/', HistoryChatbot.as_view(), name='user-history'),
    path('api/get-credentials/', SeeCredentials.as_view(), name='api-credentials'),
    path("api/test_ChatBot/", QueryView.as_view(), name="query_deepseek"),
    path("api/analytics/", UserInteractionAnalytics.as_view(), name="analytics"),
    path("deploy/<uuid:chatbot_id>/", GenerateAPIView.as_view(), name="deploy_api"),
    path('api/<uuid:api_url>/query/', PublicChatBotQueryView.as_view(), name='Public_query'),
]