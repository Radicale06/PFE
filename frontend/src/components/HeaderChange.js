import React from "react";
import ProfileDropdown from "./ProfileDropdown";

const HeaderChange = ({ name }) => {
  const handleSignOut = () => {
    console.log("User signed out");
    // Implement logout logic here (clear token, redirect, etc.)
  };

  return (
    <header className="bg-gray-900 text-white p-3 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">{name}'s Workspace</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Profile Dropdown */}
        <ProfileDropdown name={name} onSignOut={handleSignOut} />
      </div>
    </header>
  );
};

export default HeaderChange;
