import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Sidebar = () => {
  const { user, logout } = useAuth();
  return (
    <div className="w-60 h-full bg-gray-700 text-white">
      <nav className="mt-4">
        <ul>
          <li className="mb-6 pl-5">{user ? user.name : "Guest"}</li>
          <li className="hover:bg-gray-600">
            <Link to="/home" className="block p-4">
              <button>Home</button>
            </Link>
          </li>
          <li className="hover:bg-gray-600">
            <Link to="/favoritefoods" className="block p-4">
              <button>Favorite Food's</button>
            </Link>
          </li>

          <li className="hover:bg-gray-600">
            <Link to="/" className="block p-4">
              <button>Register</button>
            </Link>
          </li>
          <li className="hover:bg-gray-600">
            <Link to="/login" className="block p-4">
              <button onClick={logout}>Logout</button>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
