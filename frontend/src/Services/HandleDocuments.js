import Cookies from "js-cookie";
const handleModalSubmit = async (formData) => {
  const token = Cookies.get("access_token");

  try {
    const response = await fetch("http://localhost:8000/api/upload/", {
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
