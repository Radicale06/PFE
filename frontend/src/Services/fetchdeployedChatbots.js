import Cookies from "js-cookie";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const fetchChatbots = async () => {
  const token = Cookies.get("access_token");
  if (!token) {
    console.error("🚨 No authentication token found! Please log in.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/deployed-chatbots/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Include JWT token
      },
    });

    const data = await response.json();

    if (response.ok) {
      return data; // Set the fetched chatbots
    } else {
      console.error("❌ Failed to fetch chatbots:", data);
    }
  } catch (error) {
    console.error("🚨 Error fetching chatbots:", error.message);
  }
};
export default fetchChatbots;
