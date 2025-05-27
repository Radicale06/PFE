import Cookies from "js-cookie";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const handleWebsiteScrape = async (websiteUrl, chatbotId) => {
  const token = Cookies.get("access_token");

  try {
    const response = await fetch(`${API_BASE_URL}/api/scrape_web/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: websiteUrl,
        chatbot: chatbotId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Website scraping has started.");
    } else {
      console.error("Scrape failed:", data);
      alert("Scrape failed: " + (data.error || "Check console for details."));
    }
  } catch (error) {
    console.error("Error scraping website:", error);
    alert("An error occurred during website scraping.");
  }
};

export default handleWebsiteScrape;
