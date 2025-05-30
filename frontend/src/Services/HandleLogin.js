import Cookies from "js-cookie";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const handleLogin = async (e, username, password, setError, navigate) => {
  e.preventDefault();
  try {
    const response = await fetch(`${API_BASE_URL}/api/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      Cookies.set("access_token", data.access, { expires: 1 });
      Cookies.set("refresh_token", data.refresh, { expires: 1 });
      navigate("/dashboard", { state: { name: data.name } }); // Redirect to home page after successful login
    } else {
      setError(data.detail || "Invalid credentials!");
    }
  } catch (error) {
    setError("Something went wrong! Please try again.");
  }
};

export default handleLogin;
