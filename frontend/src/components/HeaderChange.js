// HeaderChange.js
import React from "react";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import { handleSignOut } from "../Services/logout";

const HeaderChange = ({ name }) => {
  const navigate = useNavigate();

  const onSignOut = () => {
    handleSignOut(navigate);
  };

  return (
    <header className="bg-gray-900 text-white p-3 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">{name}'s Workspace</h2>
      </div>
      <div className="flex items-center space-x-4">
        {/* Profile Dropdown */}
        <ProfileDropdown name={name} onSignOut={onSignOut} />
      </div>
    </header>
  );
};

export default HeaderChange;
