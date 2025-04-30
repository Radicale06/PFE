import re
import chromadb
from ..Views.chroma_utils import post_doc_to_chroma
import pandas as pd

# Connect to ChromaDB running in Docker
chroma_client = chromadb.HttpClient(host="localhost", port=5000)
def clean_text(text):
    if not isinstance(text, str):
        return ""  # Handle cases where text might be None or not a string
    text = text.lower()  # Convert to lowercase
    text = re.sub(r'[^a-z0-9\s]', '', text)  # Remove special characters (keep only letters, numbers, and spaces)
    text = re.sub(r'\s+', ' ', text).strip()  # Remove multiple spaces and trim leading/trailing spaces
    return text

def handle_excel(df, chatbot_id, doc_name):
    df.drop(columns=[col for col in df.columns if 'id' in col.lower()], inplace=True)
    df.dropna(axis=0, how='any', inplace=True)

    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].apply(clean_text)
    if df.shape[1] < 1:
        raise ValueError("DataFrame must contain at least one column after cleaning.")
    for index, row in df.iterrows():
        try:
            combined_text = "| ".join(f"{col.strip()}: {str(value).strip()}" for col, value in row.items() if pd.notnull(value))
            post_doc_to_chroma(combined_text, chatbot_id, doc_name, index)
            
        except Exception as e:
            print(f"Error processing row {index}: {e}")


