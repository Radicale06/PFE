// EditProfile.jsx
import React, { useState, useEffect } from "react";
import HeaderChange from "../components/HeaderChange";
import { CameraIcon } from "@heroicons/react/outline";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../Services/ProfileService"; // Fixed: lowercase path

const EditProfile = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load user profile data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Loading user profile data...");

        // First try to get data from localStorage
        const userData = localStorage.getItem("user_data");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            console.log("User data from localStorage:", user);
            setFirstName(user.first_name || "");
            setLastName(user.last_name || "");
            setEmail(user.email || "");
            setProfilePic(user.profile_picture || null);
          } catch (parseError) {
            console.error("Error parsing localStorage user data:", parseError);
          }
        }

        // Then fetch latest data from API
        const profileData = await getUserProfile();
        console.log("Profile data from API:", profileData);

        setFirstName(profileData.first_name || "");
        setLastName(profileData.last_name || "");
        setEmail(profileData.email || "");
        setProfilePic(profileData.profile_picture || null);
      } catch (error) {
        console.error("Error loading profile:", error);
        setError(`Failed to load profile data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
    }
  };

  const validateForm = () => {
    setError(""); // Clear previous errors

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("First name, last name, and email are required");
      return false;
    }

    if (password && password !== repassword) {
      setError("New passwords do not match");
      return false;
    }

    if (password && !oldPassword) {
      setError("Old password is required to change password");
      return false;
    }

    if (password && password.length < 6) {
      setError("New password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      console.log("Updating profile with data:", {
        first_name: firstName,
        last_name: lastName,
        email: email,
      });

      // Update profile information
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
      };

      await updateUserProfile(profileData);

      // Change password if provided
      if (password) {
        console.log("Changing password...");
        const passwordData = {
          old_password: oldPassword,
          new_password: password,
        };
        await changePassword(passwordData);

        // Clear password fields after successful change
        setOldPassword("");
        setPassword("");
        setRepassword("");
      }

      // Update localStorage with new data
      const updatedUserData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        profile_picture: profilePic,
      };
      localStorage.setItem("user_data", JSON.stringify(updatedUserData));

      setSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div>
        <HeaderChange name="Edit Profile" />
        <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeaderChange name="Edit Profile" />
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-6">
        <div className="bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">
            Edit Your Profile
          </h2>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded-md mb-6">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-600 text-white p-3 rounded-md mb-6">
              {success}
            </div>
          )}

          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <img
                src={profilePic || "https://via.placeholder.com/150"}
                alt="Profile"
                className="rounded-full w-full h-full object-cover border-4 border-blue-600"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition">
                <CameraIcon className="h-5 w-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
                required
              />
            </div>

            {/* Password Change Section */}
            <div className="border-t border-gray-600 pt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-200">
                Change Password (Optional)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="mt-1 block w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={repassword}
                      onChange={(e) => setRepassword(e.target.value)}
                      className="mt-1 block w-full bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md transition flex items-center"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
