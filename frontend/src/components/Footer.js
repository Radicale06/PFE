import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto text-center">
        <div className="text-3xl font-bold text-blue-600 mb-4">BotForge</div>
        <div className="text-gray-400 mb-4">
          <p>© 2025 BotForge, All Rights Reserved.</p>
        </div>
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" className="hover:text-gray-300">
            About Us
          </a>
          <a href="#" className="hover:text-gray-300">
            Contact
          </a>
          <a href="#" className="hover:text-gray-300">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-gray-300">
            Terms of Service
          </a>
        </div>
      </div>

      <div className="mb-6 flex justify-center items-center">
        <input
          type="email"
          placeholder="Subscribe to our newsletter"
          className="px-4 py-2 rounded-md text-gray-800"
        />
        <button className="ml-2 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600">
          Subscribe
        </button>
      </div>
    </footer>
  );
};
export default Footer;
