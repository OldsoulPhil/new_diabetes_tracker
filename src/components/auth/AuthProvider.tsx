import React, { createContext, useState } from "react";
import { User, AuthContextType } from "../../types/types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const authenticateUser = (
    email: string,
    name: string,
    foodEntries: any[]
  ) => {
    setIsAuthenticated(true);
    setUser({ email, name, foodEntries: foodEntries || [] });
  };

  const validateCredentials = (storedPassword: string, password: string) => {
    if (storedPassword !== password) {
      throw new Error("Invalid credentials. Please try again.");
    }
  };

  const getUserData = (email: string) => {
    const userData = localStorage.getItem(email);
    if (!userData) {
      throw new Error("User not found. Please register first.");
    }
    return JSON.parse(userData);
  };

  const updateUserData = (updatedUser: User) => {
    localStorage.setItem(updatedUser.email, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const login = async (email: string, password: string) => {
    try {
      const {
        name,
        password: storedPassword,
        foodEntries,
      } = getUserData(email);
      validateCredentials(storedPassword, password);
      authenticateUser(email, name, foodEntries);
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
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, updateUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};
