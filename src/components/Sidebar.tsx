import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getLinkClass = (path: string) => {
    return location.pathname === path
      ? "block p-4 bg-gray-600"
      : "block p-4 hover:bg-gray-600";
  };

  return (
    <div className="w-60 h-full bg-gray-700 text-white flex flex-col justify-between">
      <nav className="mt-4">
        <ul>
          <li className="mb-6 pl-5">{user ? user.name : "Guest"}</li>
          <li>
            <Link to="/home" className={getLinkClass("/home")}>
              <button>Home</button>
            </Link>
          </li>
          <li>
            <Link
              to="/favoritefoods"
              className={getLinkClass("/favoritefoods")}
            >
              <button>Favorite Food's</button>
            </Link>
          </li>
          <li>
            <Link
              to="/glucoseentries"
              className={getLinkClass("/glucoseentries")}
            >
              <button>Glucose Entries</button>
            </Link>
          </li>
          <li>
            <Link to="/comparison" className={getLinkClass("/comparison")}>
              <button>Comparison</button>
            </Link>
          </li>
        </ul>
      </nav>
      <nav className="mb-4">
        <ul>
          <li>
            <Link to="/" className={getLinkClass("/")}>
              <button>Register</button>
            </Link>
          </li>
          <li>
            <Link to="/login" className={getLinkClass("/login")}>
              <button onClick={logout}>Logout</button>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
