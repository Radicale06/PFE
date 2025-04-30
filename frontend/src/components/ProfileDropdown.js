import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaKey, FaBug, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({ name = "Guest", onSignOut }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar (Click to Open Dropdown) */}
      <div
        className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 text-white rounded-lg shadow-lg p-3 z-50">
          {/* Username */}
          <h2 className="px-3 text-gray-400 text-sm">{name}</h2>
          <hr className="border-gray-700 my-2" />

          {/* Options */}
          <ul className="text-sm">
            <li className="flex items-center p-2 hover:bg-gray-800 rounded cursor-pointer">
              <FaUser className="mr-2" onClick={navigate("/profile")} /> Update
              profile
            </li>
            <li className="flex items-center p-2 hover:bg-gray-800 rounded cursor-pointer">
              <FaKey className="mr-2" /> Change password
            </li>
            <li className="flex items-center p-2 hover:bg-gray-800 rounded cursor-pointer">
              <FaBug className="mr-2" /> Report a bug
            </li>
          </ul>

          {/* Sign Out */}
          <hr className="border-gray-700 my-2" />
          <div
            className="flex items-center text-red-500 p-2 hover:bg-gray-800 rounded cursor-pointer"
            onClick={onSignOut}
          >
            <FaSignOutAlt className="mr-2" /> Sign out
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
