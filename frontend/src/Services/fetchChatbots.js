import Cookies from "js-cookie";
const fetchChatbots = async () => {
  const token = Cookies.get("access_token");
  if (!token) {
    console.error("🚨 No authentication token found! Please log in.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/api/chatbots/", {
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
