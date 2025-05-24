import Cookies from "js-cookie";

const handleTableSubmit = async (chatbotId, dbType, credentials) => {
  const token = Cookies.get("access_token");

  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  const requestData = {
    chatbot_id: chatbotId,
    db_type: dbType,
    credentials,
  };

  try {
    const response = await fetch(
      "http://localhost:8000/api/connect_database/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      }
    );

    const responseText = await response.text();

    if (response.ok) {
      const data = JSON.parse(responseText);
      return data;
    } else {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText };
      }
      console.error("Error response:", errorData);
      throw new Error(
        errorData.error || "Connection failed. Check credentials."
      );
    }
  } catch (error) {
    console.error("Network error:", error);
    if (error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to server");
    }
    throw error;
  }
};

export default handleTableSubmit;
