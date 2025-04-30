from PyPDF2 import PdfReader
from langchain_experimental.text_splitter import SemanticChunker
from langchain_huggingface import HuggingFaceEmbeddings
from ..Views.chroma_utils import post_doc_to_chroma

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def handlePDF(chatbot_id, Docname, file):
    pdf_reader = PdfReader(file)
    page_content = [page.extract_text() for page in pdf_reader.pages]
    cleaned_content = [page.replace("\n", "") for page in page_content]
    sematic_chunker = SemanticChunker(embeddings, breakpoint_threshold_type="percentile")
    semantic_chunks = sematic_chunker.create_documents(cleaned_content)
    for index, semantic_chunk in enumerate(semantic_chunks):
        post_doc_to_chroma(semantic_chunk.page_content, chatbot_id, Docname, index)

