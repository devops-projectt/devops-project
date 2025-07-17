import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <header className="fixed top-0 right-0 w-full flex justify-end items-center px-6 py-4 z-50 pointer-events-none">
      {isLoggedIn && (
    <button
    onClick={handleLogout}
    className="flex items-center gap-1 text-xs px-3 py-1 rounded-full border-2 border-purple-600 bg-white text-purple-700 hover:bg-purple-100 hover:text-purple-900 focus:outline-none transition pointer-events-auto"
    style={{ fontSize: "0.85rem" }}
    aria-label="Logout"
  >
    <ArrowRightOnRectangleIcon className="w-4 h-4" />
    <span className="hidden sm:inline">Logout</span>
  </button>
      )}
    </header>
  );
};

export default Header;