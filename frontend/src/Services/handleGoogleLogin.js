import Cookies from "js-cookie";
const handleGoogle = async (response, navigate, setError) => {
  try {
    const res = await fetch("http://localhost:8000/api/google-login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: response.credential }), // Send the credential JWT
    });
    const data = await res.json();
    if (res.ok) {
      // Save tokens (access/refresh) to cookies/localStorage
      Cookies.set("access_token", data.access);
      Cookies.set("refresh_token", data.refresh);
      navigate("/dashboard", { state: { name: data.name } });
    } else {
      setError("Google login failed");
    }
  } catch (err) {
    setError("Network error");
  }
};
export default handleGoogle;
