import React, { useState, useContext } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { DiabetesTracker } from "../components/DiabetesTracker";
import { FoodEntryItem } from "../components/FoodEntry";
import { FoodEntry } from "../types/types";
import { AuthContext } from "../components/auth/AuthProvider";

export const Home = () => {
  const { isAuthenticated, login, logout, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const authContext = useContext(AuthContext);

  const handleLogin = () => {
    login(email, password);
  };

  const handleAddEntry = (newEntry: FoodEntry) => {
    if (user && authContext) {
      const updatedUser = {
        ...user,
        foodEntries: [...(user.foodEntries || []), newEntry],
      };
      localStorage.setItem(user.email, JSON.stringify(updatedUser));
      authContext.setUser(updatedUser);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      {isAuthenticated ? (
        <div className="flex flex-1 flex-col bg-black text-white items-center justify-center p-4">
          <h1 className="text-3xl">Welcome to My App, {user?.name}!</h1>
          <p>This is the home page content.</p>
          <p>Currently being worked on please be patient! Thank you!</p>
          <button
            onClick={logout}
            className="bg-orange-600 m-5 rounded-lg text-white px-4 py-2 hover:bg-orange-700 transition duration-200"
          >
            Logout
          </button>
          <div className="flex flex-row space-x-8 w-full max-w-4xl">
            <div className="flex-1">
              <DiabetesTracker />
            </div>
            <div className="flex-1">
              <FoodEntryItem
                onAddEntry={handleAddEntry}
                userId={user?.email || ""}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <h2>You are not logged in.</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg p-2 m-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg p-2 m-2"
          />
          <button
            onClick={handleLogin}
            className="bg-orange-700 m-5 rounded-lg text-white px-4 py-2 w-48 hover:bg-black transition duration-200"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
};
