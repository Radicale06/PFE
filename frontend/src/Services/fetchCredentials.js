import Cookies from "js-cookie";

const fetchCredentials = async (chatbot_id) => {
  try {
    const token = Cookies.get("access_token"); // Get the token from cookies
    if (!token) {
      console.error("🚨 No authentication token found! Please log in.");
      return; // Early exit if no token found
    }

    // Send the POST request to fetch the history data
    const response = await fetch("http://localhost:8000/api/get-credentials/", {
      method: "POST", // Use POST to send the chatbot_id in the body
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add the token to the request header
      },
      body: JSON.stringify({ chatbot_id }), // Send chatbot_id in the request body
    });

    // Check if the response is ok (status code 200-299)
    if (!response.ok) {
      if (response.status === 401) {
        console.error("🚨 Unauthorized! Please log in again.");
        window.location.href = "/login"; // Redirect to the login page
      } else {
        throw new Error("Failed to fetch history data");
      }
    }

    // Try to parse the response as JSON
    const data = await response.json();
    return data;
  } catch (error) {
    // Catch and log errors (e.g., network issues, invalid responses, etc.)
    console.error("Error fetching history data:", error);
    throw error; // Re-throw error to be handled by the caller
  }
};

export default fetchCredentials;
