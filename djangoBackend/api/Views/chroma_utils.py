import chromadb
from dotenv import load_dotenv
load_dotenv()
import os
chroma_client = chromadb.HttpClient(host=os.getenv('CHROMA_DB_HOST'), port=int(os.getenv('CHROMA_DB_PORT')))
def get_doc_from_chroma(querry, chatbot_id):
    collections = chroma_client.get_collection("BotForge")
    results = collections.query(
        query_texts=[querry],
        n_results=2,
        where={"chatbot_id": {"$eq": chatbot_id}}
    )
    return results

def post_doc_to_chroma(doc, chatbot_id, doc_name, index):
    chroma_collection = chroma_client.get_or_create_collection("BotForge")
    chroma_collection.add(
        documents=[doc],
        metadatas=[{"chatbot_id": chatbot_id}],
        ids=[f"{doc_name}_{index}"])

