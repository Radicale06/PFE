// services/authService.js
import Cookies from "js-cookie";

export const handleSignOut = async (navigate) => {
  try {
    const token = Cookies.get("access_token");

    if (token) {
      // Call logout API
      await fetch("http://localhost:8000/api/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Clear all authentication data
    Cookies.remove("access_token");
    Cookies.remove("refresh_token"); // If you store user data in localStorage

    // Redirect to login page
    navigate("/"); // Redirect to dashboard or any other page
  } catch (error) {
    console.error("Error during logout:", error);

    // Even if API call fails, clear local data and redirect
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    navigate("/"); // Redirect to dashboard or any other page
  }
};
