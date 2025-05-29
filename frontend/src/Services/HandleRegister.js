const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const handleSignUp = async (
  e,
  first_name,
  last_name,
  username,
  password,
  confirmPassword,
  setError,
  navigate
) => {
  e.preventDefault();
  console.log("API_BASE_URL:", API_BASE_URL);

  try {
    const response = await fetch(`${API_BASE_URL}/api/user/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: first_name,
        last_name: last_name,
        username: username,
        password: password,
        password2: confirmPassword,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      navigate("/Login"); // Redirect to login page after successful registration
    } else {
      setError(data.detail || "Registration failed!");
    }
  } catch (error) {
    setError("Something went wrong! Please try again.");
  }
};

// Export the function correctly
export default handleSignUp;
