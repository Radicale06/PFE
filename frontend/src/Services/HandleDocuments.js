import Cookies from "js-cookie";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const handleModalSubmit = async (formData) => {
  const token = Cookies.get("access_token");

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      alert("Document uploaded successfully");
    } else {
      const errorData = await response.json();
      console.error("Upload failed:", errorData);
      alert("Upload failed. Check console for details.");
    }
  } catch (error) {
    console.error("Error uploading document:", error);
    alert("An error occurred during upload.");
  }
};
export default handleModalSubmit;
