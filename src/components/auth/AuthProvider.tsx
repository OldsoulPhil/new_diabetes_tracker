import React, { createContext, useState } from "react";
import { User, AuthContextType } from "../../types/types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const userData = localStorage.getItem(email);
      if (userData) {
        const {
          name,
          password: storedPassword,
          foodEntries,
        } = JSON.parse(userData);
        if (storedPassword === password) {
          setIsAuthenticated(true);
          setUser({ email, name, foodEntries: foodEntries || [] });
        } else {
          throw new Error("Invalid credentials. Please try again.");
        }
      } else {
        throw new Error("User not found. Please register first.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
