import Cookies from "js-cookie";

const createChatbot = async (chatbotData) => {
  try {
    const token = Cookies.get("access_token");
    if (!token) {
      console.error("🚨 No authentication token found! Please log in.");
      return;
    }
    const response = await fetch("http://localhost:8000/api/chatbots/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include JWT token
      },
      body: JSON.stringify(chatbotData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Failed to create chatbot:", data);
      throw new Error(data.detail || "Failed to create chatbot");
    }

    console.log("✅ Chatbot Created:", data);
    return data; // Return chatbot details if needed
  } catch (error) {
    console.error("🚨 Error creating chatbot:", error.message);
  }
};
export default createChatbot;
