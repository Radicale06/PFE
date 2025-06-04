import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import handleLogin from "../Services/HandleLogin";
import SignImage from "../assets/Sign.jpg";
import handleGoogle from "../Services/handleGoogleLogin";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import ReCAPTCHA from "react-google-recaptcha";

const client_id = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isHuman, setIsHuman] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = (response) => {
    handleGoogle(response, navigate, setError);
  };
  const handleRecaptchaChange = (token) => {
    if (token) {
      setRecaptchaToken(token);
      setIsHuman(true);
    }
  };

  const handleGoogleFailure = (error) => {
    setError("Google Login failed. Please try again.");
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isHuman) {
      setError("Please verify that you are not a robot.");
      return;
    }
    handleLogin(e, username, password, setError, navigate); // Include the reCAPTCHA token in the login request
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100"
      style={{
        backgroundImage: `url(${SignImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Sign in to your account
        </h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <a
              href="/forget"
              className="text-sm text-indigo-600 hover:text-indigo-500 "
            >
              Forgot password?
            </a>
          </div>
          <div className="flex justify-center items-center mt-6 mb-8">
            <ReCAPTCHA
              sitekey={recaptchaSiteKey}
              onChange={handleRecaptchaChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <GoogleOAuthProvider clientId={client_id}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                text="Google"
              />
            </GoogleOAuthProvider>
            ,
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Not a member?{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
