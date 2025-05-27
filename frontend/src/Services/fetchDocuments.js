import Cookies from "js-cookie";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const fetchChatbotDocuments = async (chatbotId) => {
  const token = Cookies.get("access_token");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/documents/?chatbot=${chatbotId}`,
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
