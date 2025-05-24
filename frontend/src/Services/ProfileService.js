// services/profileService.js
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:8000/api";

export const getUserProfile = async () => {
  try {
    const token = Cookies.get("access_token");

    if (!token) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/profile/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Profile response error:", errorText);
      throw new Error(
        `Failed to fetch user profile: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();

    // Handle both success: true format and direct data format
    return data.success ? data.data : data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const token = Cookies.get("access_token");

    if (!token) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/profile/update/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Update profile error:", errorText);

      try {
        const errorData = JSON.parse(errorText);
        throw new Error(
          errorData.message || `Failed to update profile: ${response.status}`
        );
      } catch (parseError) {
        throw new Error(
          `Failed to update profile: ${response.status} - ${errorText}`
        );
      }
    }

    const data = await response.json();

    return data.success ? data.data : data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const token = Cookies.get("access_token");

    if (!token) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/change-password/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Change password error:", errorText);

      try {
        const errorData = JSON.parse(errorText);
        // Handle validation errors
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          throw new Error(errorMessages.join(", "));
        }
        throw new Error(
          errorData.message || `Failed to change password: ${response.status}`
        );
      } catch (parseError) {
        throw new Error(
          `Failed to change password: ${response.status} - ${errorText}`
        );
      }
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};
