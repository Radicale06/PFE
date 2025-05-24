import Cookies from "js-cookie";

const fetchChatbotDocuments = async (chatbotId) => {
  const token = Cookies.get("access_token");

  try {
    const response = await fetch(
      `http://localhost:8000/api/documents/?chatbot=${chatbotId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching documents:", errorData);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Request failed:", error);
    return [];
  }
};

export default fetchChatbotDocuments;
