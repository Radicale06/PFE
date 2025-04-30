import React, { useState } from "react";
const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed w-full bg-white shadow-md z-50 top-0">
      <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
        <div className="text-3xl font-extrabold text-blue-600">BotForge</div>
        <nav className="space-x-8">
          <button
            onClick={() => handleScroll("trending")}
            className="text-black hover:text-blue-600 text-xl transition-colors duration-300"
          >
            Trends
          </button>
          <button
            onClick={() => handleScroll("pricing")}
            className="text-black hover:text-blue-600 text-xl transition-colors duration-300"
          >
            Offres
          </button>
          <button
            onClick={() => handleScroll("why")}
            className="text-black hover:text-blue-600 text-xl transition-colors duration-300"
          >
            Why BotForge
          </button>
          <button
            onClick={() => handleScroll("faq")}
            className="text-black hover:text-blue-600 text-xl transition-colors duration-300"
          >
            FAQ
          </button>

          {/* Language Dropdown */}
          <div className="relative inline-block">
            <button
              className="bg-black text-white border border-white px-4 py-2 rounded-md transition-colors duration-300"
              onClick={toggleDropdown}
            >
              Français <span>▼</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-black text-white rounded-md shadow-lg">
                <ul>
                  <li className="px-4 py-2 hover:bg-blue-600 cursor-pointer">
                    Arabic
                  </li>
                  <li className="px-4 py-2 hover:bg-blue-600 cursor-pointer">
                    English
                  </li>
                  <li className="px-4 py-2 hover:bg-blue-600 cursor-pointer">
                    Français
                  </li>
                </ul>
              </div>
            )}
          </div>

          <a
            href="/login"
            className="bg-blue-600 px-6 py-2 rounded-md text-white hover:bg-red-500 transition-all duration-300"
          >
            Login
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
