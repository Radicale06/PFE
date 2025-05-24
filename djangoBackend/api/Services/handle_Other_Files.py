from PyPDF2 import PdfReader
from langchain_experimental.text_splitter import SemanticChunker
from langchain_huggingface import HuggingFaceEmbeddings
from ..Views.chroma_utils import post_doc_to_chroma
from docx import Document


embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def handlePDF(chatbot_id, Docname, file):
    pdf_reader = PdfReader(file)
    page_content = [page.extract_text() for page in pdf_reader.pages]
    cleaned_content = [page.replace("\n", "") for page in page_content]
    sematic_chunker = SemanticChunker(embeddings, breakpoint_threshold_type="percentile")
    semantic_chunks = sematic_chunker.create_documents(cleaned_content)
    for index, semantic_chunk in enumerate(semantic_chunks):
        post_doc_to_chroma(semantic_chunk.page_content, chatbot_id, Docname, index)

def handleTXT(chatbot_id, Docname, file):
    text = file.read().decode("utf-8")  # ensure UTF-8 decoding
    cleaned_text = text.replace("\n", "")
    sematic_chunker = SemanticChunker(embeddings, breakpoint_threshold_type="percentile")
    semantic_chunks = sematic_chunker.create_documents([cleaned_text])

    for index, semantic_chunk in enumerate(semantic_chunks):
        post_doc_to_chroma(semantic_chunk.page_content, chatbot_id, Docname, index)


def handleDOC(chatbot_id, Docname, file):
    doc = Document(file)
    full_text = []

    for para in doc.paragraphs:
        full_text.append(para.text)

    cleaned_text = " ".join(full_text).replace("\n", "")
    sematic_chunker = SemanticChunker(embeddings, breakpoint_threshold_type="percentile")
    semantic_chunks = sematic_chunker.create_documents([cleaned_text])

    for index, semantic_chunk in enumerate(semantic_chunks):
        post_doc_to_chroma(semantic_chunk.page_content, chatbot_id, Docname, index)

