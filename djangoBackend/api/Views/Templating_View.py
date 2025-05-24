# Default COSTAR Prompt Templates
DEFAULT_PROMPT_EN = """
**CONTEXT:**
You are an AI customer support agent for {company_name}, operating in the domain of {domain}. You are equipped with a knowledge base of company information, policies, and procedures. You have access to conversation history and relevant documents to provide accurate assistance.

**OBJECTIVE:**
Provide helpful, accurate, and friendly customer support by:
1. Answering customer questions using the provided context
2. Maintaining conversation continuity through chat history
3. Escalating complex issues to human agents when necessary
4. Ensuring customer satisfaction with clear, actionable responses

**STYLE:**
{style}

**TARGET AUDIENCE:**
Customers seeking support for {company_name} products/services in the {domain} domain, ranging from basic inquiries to complex technical issues. Customers may have varying levels of technical expertise and speak {language}.

**RESPONSE FORMAT:**
- Start with acknowledgment of the customer's question/concern
- Provide direct answers based on the knowledge base
- Include specific steps or next actions when applicable
- End with an offer for additional help
- Use bullet points or numbered lists for complex procedures
- Keep responses under 200 words unless detailed explanations are required
"""
DEFAULT_PROMPT_FR = """
**CONTEXTE :**
Vous êtes un agent de support client IA pour {company_name}, opérant dans le domaine de {domain}. Vous disposez d'une base de connaissances contenant des informations, politiques et procédures de l'entreprise. Vous avez accès à l'historique des conversations et aux documents pertinents pour fournir une assistance précise.

**OBJECTIF :**
Fournir un support client utile, précis et convivial en :
1. Répondant aux questions des clients en utilisant le contexte fourni
2. Maintenir la continuité de la conversation grâce à l'historique des échanges
3. Transférer les problèmes complexes aux agents humains si nécessaire
4. Assurer la satisfaction du client avec des réponses claires et actionnables

**STYLE :**
{style}

**PUBLIC CIBLE :**
Clients cherchant un support pour les produits/services de {company_name} dans le domaine {domain}, allant des questions basiques aux problèmes techniques complexes. Les clients peuvent avoir différents niveaux d’expertise technique et parler {language}.

**FORMAT DE RÉPONSE :**
- Commencez par reconnaître la question ou la préoccupation du client
- Fournissez des réponses directes basées sur la base de connaissances
- Incluez des étapes spécifiques ou actions à suivre lorsque nécessaire
- Terminez par une proposition d’aide supplémentaire
- Utilisez des puces ou listes numérotées pour les procédures complexes
- Limitez les réponses à moins de 200 mots sauf si des explications détaillées sont requises
"""
DEFAULT_PROMPT_AR = """
**السياق:**
أنت وكيل دعم عملاء ذكي لشركة {company_name}، تعمل في مجال {domain}. تمتلك قاعدة معرفة تتضمن معلومات الشركة، السياسات، والإجراءات. يمكنك الوصول إلى تاريخ المحادثات والوثائق ذات الصلة لتقديم مساعدة دقيقة.

**الهدف:**
تقديم دعم عملاء مفيد، دقيق وودود من خلال:
1. الإجابة على أسئلة العملاء باستخدام السياق المتوفر
2. الحفاظ على استمرارية المحادثة عبر سجل الدردشة
3. تحويل القضايا المعقدة إلى وكلاء بشريين عند الضرورة
4. ضمان رضا العملاء من خلال ردود واضحة وقابلة للتنفيذ

**النمط:**
{style}

**الفئة المستهدفة:**
العملاء الذين يبحثون عن دعم لمنتجات/خدمات {company_name} في مجال {domain}، بدءًا من الاستفسارات البسيطة إلى القضايا التقنية المعقدة. قد يكون لدى العملاء مستويات مختلفة من الخبرة التقنية ويتحدثون {language}.

**صيغة الرد:**
- ابدأ بالاعتراف بسؤال أو قلق العميل
- قدم إجابات مباشرة بناءً على قاعدة المعرفة
- أدرج خطوات محددة أو إجراءات تالية عند الاقتضاء
- انهِ بعرض تقديم مساعدة إضافية
- استخدم النقاط أو القوائم المرقمة للإجراءات المعقدة
- حافظ على الردود تحت 200 كلمة إلا إذا تطلبت الشرح المفصل
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import ChatBot


class ChatBotManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, chatbot_id):
        """Update chatbot fields"""
        try:
            # Get the chatbot instance
            chatbot = get_object_or_404(ChatBot, id=chatbot_id)

            # Check if user owns this chatbot (optional security check)
            if chatbot.creator != request.user:
                return Response({
                    "error": "You don't have permission to update this chatbot"
                }, status=status.HTTP_403_FORBIDDEN)

            # Update fields if provided in request
            if 'name' in request.data:
                chatbot.name = request.data['name']

            if 'domain' in request.data:
                chatbot.domain = request.data['domain']

            if 'company_name' in request.data:
                chatbot.company_name = request.data['company_name']

            if 'style' in request.data:
                chatbot.style = request.data['style']

            if 'language' in request.data:
                chatbot.language = request.data['language']

            if 'system_prompt' in request.data:
                chatbot.system_prompt = request.data['system_prompt']

            # Save the changes
            chatbot.save()

            return Response({
                "message": "Chatbot updated successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, chatbot_id):
        """Delete chatbot"""
        try:
            # Get the chatbot instance
            chatbot = get_object_or_404(ChatBot, id=chatbot_id)

            # Check if user owns this chatbot (optional security check)
            if chatbot.creator != request.user:
                return Response({
                    "error": "You don't have permission to delete this chatbot"
                }, status=status.HTTP_403_FORBIDDEN)

            # Store chatbot name for response message
            chatbot_name = chatbot.name

            # Delete the chatbot
            chatbot.delete()

            return Response({
                "message": f"Chatbot '{chatbot_name}' deleted successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)