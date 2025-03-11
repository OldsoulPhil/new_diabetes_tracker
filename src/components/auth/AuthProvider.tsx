import React, { createContext, useState, ReactNode } from "react";
import { User, AuthContextType, FoodEntry } from "../../types/types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const authenticateUser = (
    email: string,
    name: string,
    foodEntries: FoodEntry[]
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
    const storedData = JSON.parse(
      localStorage.getItem(updatedUser.email) || "{}"
    );
    const updatedStorage = {
      ...storedData,
      foodEntries: updatedUser.foodEntries,
    };
    localStorage.setItem(updatedUser.email, JSON.stringify(updatedStorage));
    setUser(updatedUser);
  };

  const login = async (email: string, password: string) => {
    try {
      const { name, password: storedPassword } = getUserData(email);
      validateCredentials(storedPassword, password);
      let foodEntries: FoodEntry[] = [];
      if (localStorage.getItem(email)) {
        let userData = JSON.parse(localStorage.getItem(email) as string);
        if (userData.foodEntries) {
          foodEntries = userData.foodEntries;
        }
      }
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
