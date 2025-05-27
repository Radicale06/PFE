from django.urls import path, include
import uuid
from .Views.API_Generation_View import GenerateAPIView
from .Views.User_View import CreateUserView
from .Views.ChatBot_View import ChatBotCreateView, UserChatBotsView, DeployedChatBotsView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .Views.token_view import CustomTokenObtainPairView
from .Views.Documents_View import DocumentCreateView
from .Views.Chat_View import QueryView
from .Views.Templating_View import ChatBotManagementView
from .Views.Public_Genration_View import PublicChatBotQueryView
from .Views.Google_Auth import GoogleLoginView
from .Views.History_View import HistoryChatbot, SeeCredentials
from .Views.User_Interaction_Analytics import UserInteractionAnalytics
from .Views.WebSiteScrapeView import ScrapeFromSitemapView
from .Views.Documents_fetching import ChatbotDocumentsView
from .Views.function_call_View import ChatbotCreatorView
from .Views.DatabaseConnectionView import DatabaseConnectionView
from .Views.Logout_View import LogoutView
from .Views.Modify_Account_View import (UserProfileView, UserProfileUpdateView,  ChangePasswordView)


urlpatterns = [
    path('api/user/register/', CreateUserView.as_view(), name='register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls')),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/profile/update/', UserProfileUpdateView.as_view(), name='user-profile-update'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/logout/', LogoutView.as_view(), name='Logout'),
    path("api/google-login/", GoogleLoginView.as_view(), name="google-login"),
    path('api/chatbots/create/', ChatBotCreateView.as_view(), name='chatbot-create'),
    path('api/chatbots/', UserChatBotsView.as_view(), name="user-chatbots"),
    path('api/chatbots/<str:chatbot_id>/', ChatBotManagementView.as_view(), name='chatbot-management'),
    path('api/deployed-chatbots/', DeployedChatBotsView.as_view(), name="user-deployed-chatbots"),
    path('api/upload/', DocumentCreateView.as_view(), name="user-documents"),
    path('api/get-history/', HistoryChatbot.as_view(), name='user-history'),
    path('api/get-credentials/', SeeCredentials.as_view(), name='api-credentials'),
    path('api/test_ChatBot/', QueryView.as_view(), name="query_deepseek"),
    path('api/analytics/', UserInteractionAnalytics.as_view(), name="analytics"),
    path('api/scrape_web/', ScrapeFromSitemapView.as_view(), name="scrape-web"),
    path('api/connect_database/', DatabaseConnectionView.as_view(), name="connect_database"),
    path('api/documents/', ChatbotDocumentsView.as_view(), name='chatbot-documents'),
    path('api/chatbot-creator/', ChatbotCreatorView.as_view(), name='chatbot_creator'),
    path('deploy/<uuid:chatbot_id>/', GenerateAPIView.as_view(), name="deploy_api"),
    path('api/<uuid:api_url>/query/', PublicChatBotQueryView.as_view(), name='Public_query'),
]