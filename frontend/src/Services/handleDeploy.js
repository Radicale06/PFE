import Cookies from "js-cookie";

const handleDeploy = async (chatbotId) => {
  const token = Cookies.get("access_token");

  if (!token) {
    console.error("🚨 No authentication token found.");
    return { error: "Not authenticated" };
  }

  try {
    const response = await fetch(`http://localhost:8000/deploy/${chatbotId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Deployment failed:", data);
      return { error: data.detail || "Deployment failed" };
    }

    return {
      api_url: data.api_url,
      token: data.deployment_token,
      chatbot_name: data.chatbot_name,
    };
  } catch (error) {
    console.error("🚨 Error during deployment:", error.message);
    return { error: error.message };
  }
};

export default handleDeploy;
