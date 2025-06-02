from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from ..models import ChatBot, Document
from ..serializers import DocumentSerializer
from ..Services.handle_url import get_all_urls_from_sitemaps_silent, setup_driver, extract_all_text
from ..Services.handle_Other_Files import handleTXT, handlePDF
import tempfile
import requests
from urllib.parse import urlparse
import os

class ScrapeFromSitemapView(APIView):
    def post(self, request, *args, **kwargs):
        website_url = request.data.get("url")
        chatbot_id = request.data.get("chatbot")
        chatbot = get_object_or_404(ChatBot, id=chatbot_id)

        urls = get_all_urls_from_sitemaps_silent(website_url)
        driver = setup_driver()

        for url in urls:
            parsed = url.lower()
            try:
                path = urlparse(url).path
                print("path: ",path)
                raw_name, _ = os.path.splitext(os.path.basename(path)) or 'scraped'
                print("raw_name: ",raw_name)

                if parsed.endswith('.pdf') or parsed.endswith('.txt'):
                    ext = '.pdf' if parsed.endswith('.pdf') else '.txt'
                    r = requests.get(url, timeout=15)
                    file_name = f"{raw_name}{ext}"
                    file_content = ContentFile(r.content, name=file_name)
                    doc = Document(chatbot=chatbot, type=ext)
                    doc.file.save(file_name, file_content)
                    doc.save()
                    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
                    tmp.write(r.content)
                    tmp_path = tmp.name
                    tmp.close()
                    if ext == '.pdf':
                        handlePDF(chatbot_id, file_name, tmp_path, ext)
                    else:
                        handleTXT(chatbot_id, file_name, tmp_path, ext)
                else:
                    driver.get(url)
                    html = driver.page_source
                    text = extract_all_text(html)
                    if text:
                        file_name = f"{raw_name}.txt"
                        content_file = ContentFile(text.encode("utf-8"), name=file_name)
                        doc = Document(chatbot=chatbot, type="scrapped")
                        doc.file.save(file_name, content_file)
                        doc.save()
                        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".txt", mode='w', encoding='utf-8')
                        tmp.write(text)
                        tmp_path = tmp.name
                        tmp.close()
                        handleTXT(chatbot_id, file_name, tmp_path, ".txt")
            except Exception:
                continue

        driver.quit()
        return Response({"message": "Scraping complete"}, status=status.HTTP_200_OK)
