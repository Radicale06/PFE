import chromadb
from dotenv import load_dotenv
import os
from typing import List, Dict, Any, Optional

load_dotenv()


class ChatbotVectorStore:
    def __init__(self):
        self.chroma_client = chromadb.HttpClient(
            host=os.getenv('CHROMA_DB_HOST'),
            port=int(os.getenv('CHROMA_DB_PORT'))
        )
        self.collection_name = "BotForge"

    def _chatbot_ids_to_string(self, chatbot_ids: List[str]) -> str:
        """Convert list of chatbot IDs to comma-separated string"""
        return ",".join(sorted(chatbot_ids))

    def _string_to_chatbot_ids(self, chatbot_ids_str: str) -> List[str]:
        """Convert comma-separated string to list of chatbot IDs"""
        if not chatbot_ids_str:
            return []
        return [id.strip() for id in chatbot_ids_str.split(",") if id.strip()]

    def _chatbot_in_string(self, chatbot_id: str, chatbot_ids_str: str) -> bool:
        """Check if chatbot_id is in the comma-separated string"""
        chatbot_ids = self._string_to_chatbot_ids(chatbot_ids_str)
        return chatbot_id in chatbot_ids

    def get_doc_from_chroma(self, query: str, chatbot_id: str, n_results: int = 2) -> Dict[str, Any]:
        """
        Retrieve documents from ChromaDB filtered by chatbot_id

        Args:
            query: Search query string
            chatbot_id: ID of the chatbot to filter by
            n_results: Number of results to return (default: 2)

        Returns:
            Query results from ChromaDB
        """
        try:
            collection = self.chroma_client.get_collection(self.collection_name)

            # Get all documents and filter manually since ChromaDB has limited where clause support
            all_results = collection.query(
                query_texts=[query],
                n_results=n_results * 10,  # Get more results to filter from
            )

            # Filter results manually
            filtered_documents = []
            filtered_metadatas = []
            filtered_distances = []
            filtered_ids = []

            if all_results['documents'] and all_results['documents'][0]:
                for i in range(len(all_results['documents'][0])):
                    metadata = all_results['metadatas'][0][i]

                    # Check if this document belongs to the chatbot
                    belongs_to_chatbot = False

                    # New format - comma-separated chatbot IDs
                    if 'chatbot_ids' in metadata:
                        if self._chatbot_in_string(chatbot_id, metadata['chatbot_ids']):
                            belongs_to_chatbot = True
                    # Old format - single chatbot ID (backwards compatibility)
                    elif 'chatbot_id' in metadata and metadata['chatbot_id'] == chatbot_id:
                        belongs_to_chatbot = True

                    if belongs_to_chatbot:
                        filtered_documents.append(all_results['documents'][0][i])
                        filtered_metadatas.append(metadata)
                        if all_results.get('distances'):
                            filtered_distances.append(all_results['distances'][0][i])
                        filtered_ids.append(all_results['ids'][0][i])

                        # Stop when we have enough results
                        if len(filtered_documents) >= n_results:
                            break

            # Return in the same format as ChromaDB
            result = {
                'documents': [filtered_documents],
                'metadatas': [filtered_metadatas],
                'ids': [filtered_ids]
            }
            if filtered_distances:
                result['distances'] = [filtered_distances]

            return result

        except Exception as e:
            print(f"Error retrieving documents: {e}")
            return {"documents": [], "metadatas": [], "ids": []}

    def post_doc_to_chroma(self, doc: str, chatbot_id: str, doc_name: str, index: int,
                           additional_metadata: Optional[Dict] = None, doc_id: Optional[str] = None) -> bool:
        """
        Store document in ChromaDB with chatbot_id metadata.
        If document already exists, add chatbot_id to the existing chatbot_ids string.

        Args:
            doc: Document content to store
            chatbot_id: ID of the chatbot
            doc_name: Name/identifier for the document
            index: Index for the document chunk
            additional_metadata: Optional additional metadata to store
            doc_id: Optional custom document ID (if not provided, auto-generated)

        Returns:
            True if successful, False otherwise
        """
        try:
            collection = self.chroma_client.get_or_create_collection(self.collection_name)

            # Generate document ID if not provided
            if doc_id is None:
                doc_id = f"{doc_name}_{index}"

            # Check if document already exists
            try:
                existing_doc = collection.get(ids=[doc_id])
                if existing_doc['ids'] and len(existing_doc['ids']) > 0:
                    # Document exists, update chatbot_ids
                    existing_metadata = existing_doc['metadatas'][0]

                    # Handle both old and new metadata formats
                    if 'chatbot_ids' in existing_metadata:
                        chatbot_ids = self._string_to_chatbot_ids(existing_metadata['chatbot_ids'])
                        if chatbot_id not in chatbot_ids:
                            chatbot_ids.append(chatbot_id)
                    elif 'chatbot_id' in existing_metadata:
                        # Convert from old format to new format
                        existing_chatbot_id = existing_metadata['chatbot_id']
                        chatbot_ids = [existing_chatbot_id]
                        if chatbot_id not in chatbot_ids:
                            chatbot_ids.append(chatbot_id)
                    else:
                        chatbot_ids = [chatbot_id]

                    # Update metadata
                    updated_metadata = existing_metadata.copy()
                    updated_metadata['chatbot_ids'] = self._chatbot_ids_to_string(chatbot_ids)
                    # Remove old chatbot_id field if it exists
                    updated_metadata.pop('chatbot_id', None)

                    if additional_metadata:
                        updated_metadata.update(additional_metadata)

                    # Delete and re-add with updated metadata
                    collection.delete(ids=[doc_id])
                    collection.add(
                        documents=[existing_doc['documents'][0]],
                        metadatas=[updated_metadata],
                        ids=[doc_id]
                    )
                    return True
            except:
                # Document doesn't exist, create new one
                pass

            # Prepare metadata for new document
            metadata = {
                "chatbot_ids": chatbot_id,  # Start with single ID as string
                "doc_name": doc_name,
                "index": index
            }
            if additional_metadata:
                metadata.update(additional_metadata)

            collection.add(
                documents=[doc],
                metadatas=[metadata],
                ids=[doc_id]
            )
            return True

        except Exception as e:
            print(f"Error storing document: {e}")
            return False

    def delete_chatbot_docs(self, chatbot_id: str) -> bool:
        """
        Remove chatbot_id from shared documents or delete documents exclusive to this chatbot

        Args:
            chatbot_id: ID of the chatbot whose association should be removed

        Returns:
            True if successful, False otherwise
        """
        try:
            collection = self.chroma_client.get_collection(self.collection_name)

            # Get all documents
            all_docs = collection.get()
            documents_to_update = []
            documents_to_delete = []

            if not all_docs['ids']:
                print(f"No documents found for chatbot_id: {chatbot_id}")
                return True

            for i, doc_id in enumerate(all_docs['ids']):
                metadata = all_docs['metadatas'][i]
                document_content = all_docs['documents'][i]

                # Check if this document belongs to the chatbot
                belongs_to_chatbot = False

                if 'chatbot_ids' in metadata:
                    # New format - comma-separated chatbot IDs
                    if self._chatbot_in_string(chatbot_id, metadata['chatbot_ids']):
                        belongs_to_chatbot = True
                        chatbot_ids = self._string_to_chatbot_ids(metadata['chatbot_ids'])
                        chatbot_ids.remove(chatbot_id)

                        if len(chatbot_ids) > 0:
                            # Still shared by other chatbots, update metadata
                            updated_metadata = metadata.copy()
                            updated_metadata['chatbot_ids'] = self._chatbot_ids_to_string(chatbot_ids)
                            documents_to_update.append({
                                'id': doc_id,
                                'document': document_content,
                                'metadata': updated_metadata
                            })
                        else:
                            # No other chatbots using this document, delete it
                            documents_to_delete.append(doc_id)

                elif 'chatbot_id' in metadata and metadata['chatbot_id'] == chatbot_id:
                    # Old format - single chatbot ID, delete the document
                    belongs_to_chatbot = True
                    documents_to_delete.append(doc_id)

            # Delete documents that are no longer needed
            if documents_to_delete:
                collection.delete(ids=documents_to_delete)
                print(f"Deleted {len(documents_to_delete)} exclusive documents for chatbot_id: {chatbot_id}")

            # Update documents that are shared with other chatbots
            for doc_info in documents_to_update:
                collection.delete(ids=[doc_info['id']])
                collection.add(
                    documents=[doc_info['document']],
                    metadatas=[doc_info['metadata']],
                    ids=[doc_info['id']]
                )

            if documents_to_update:
                print(f"Updated {len(documents_to_update)} shared documents for chatbot_id: {chatbot_id}")

            total_affected = len(documents_to_delete) + len(documents_to_update)
            if total_affected == 0:
                print(f"No documents found for chatbot_id: {chatbot_id}")
            else:
                print(f"Total documents affected: {total_affected}")

            return True

        except Exception as e:
            print(f"Error deleting/updating documents for chatbot_id {chatbot_id}: {e}")
            return False


# Backwards compatible functions
def get_doc_from_chroma(query: str, chatbot_id: str, n_results: int = 2):
    """Backwards compatible function"""
    store = ChatbotVectorStore()
    return store.get_doc_from_chroma(query, chatbot_id, n_results)


def post_doc_to_chroma(doc: str, chatbot_id: str, doc_name: str, index: int):
    """Backwards compatible function"""
    store = ChatbotVectorStore()
    return store.post_doc_to_chroma(doc, chatbot_id, doc_name, index)


def delete_chatbot_docs(chatbot_id: str):
    """Delete/update all documents for a specific chatbot"""
    store = ChatbotVectorStore()
    return store.delete_chatbot_docs(chatbot_id)
