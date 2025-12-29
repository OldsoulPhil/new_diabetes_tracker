import { useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
}

const NavLink = ({ to, isActive, children }: NavLinkProps) => (
  <li>
    <Link
      to={to}
      className={`block p-4 transition-colors duration-200 ${
        isActive ? "bg-gray-600" : "hover:bg-gray-600"
      }`}
    >
      {children}
    </Link>
  </li>
);

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout, navigate]);

  const displayName = useMemo(() => {
    return user?.name || "Guest";
  }, [user?.name]);

  const navItems = useMemo(
    () => [
      { path: "/home", label: "Home" },
      { path: "/favoritefoods", label: "Favorite Foods" },
      { path: "/glucoseentries", label: "Glucose Entries" },
      { path: "/mood-tracker", label: "Mood Tracker" },
      { path: "/comparison", label: "Comparison" },
      { path: "/insulin-calculator", label: "Insulin Calculator" },
    ],
    []
  );

  return (
    <>
      {/* Mobile Hamburger Button - Only show when menu is closed */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 bg-gray-700 text-white p-3 rounded-lg shadow-lg"
          aria-label="Open menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Desktop Toggle Button - Show when sidebar is collapsed */}
      {isDesktopCollapsed && (
        <button
          onClick={() => setIsDesktopCollapsed(false)}
          className="hidden md:block fixed top-4 left-4 z-50 bg-gray-700 text-white p-3 rounded-lg shadow-lg hover:bg-gray-600 transition"
          aria-label="Open sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          w-60 h-screen
          bg-gray-700 text-white
          flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          z-40
          fixed top-0 left-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          ${
            !isDesktopCollapsed
              ? "md:fixed md:translate-x-0 md:h-screen"
              : "md:fixed md:-translate-x-full"
          }
        `}
      >
        <nav className="mt-4">
          <ul>
            {/* Close button and username row */}
            <li className="mb-6 pl-5 pr-3 text-lg font-semibold flex justify-between items-center">
              <span>{displayName}</span>
              {/* Mobile close button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden text-white hover:text-gray-300 transition"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {/* Desktop collapse button */}
              <button
                onClick={() => setIsDesktopCollapsed(true)}
                className="hidden md:block text-white hover:text-gray-300 transition"
                aria-label="Collapse sidebar"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </li>
            {navItems.map((item) => (
              <div key={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                <NavLink
                  to={item.path}
                  isActive={location.pathname === item.path}
                >
                  {item.label}
                </NavLink>
              </div>
            ))}
          </ul>
        </nav>

        <nav className="mb-4">
          <ul>
            <div onClick={() => setIsMobileMenuOpen(false)}>
              <NavLink to="/" isActive={location.pathname === "/"}>
                Register
              </NavLink>
            </div>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left p-4 hover:bg-gray-600 transition-colors duration-200"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};
