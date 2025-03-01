import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { FoodEntry } from "../types/types";

export const FavoriteFood = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [entries, setEntries] = useState<FoodEntry[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const favorites = user.foodEntries.filter((entry) => entry.favorite);
      setEntries(favorites);
    }
  }, [isAuthenticated, user]);

  const handleDeleteFavoriteEntry = (index: number) => {
    if (user) {
      const updatedFoodEntries = user.foodEntries.filter(
        (entry, i) => !(entry.favorite && i === index)
      );
      const updatedUser = { ...user, foodEntries: updatedFoodEntries };
      localStorage.setItem(user.email, JSON.stringify(updatedUser));
      setEntries(updatedFoodEntries.filter((entry) => entry.favorite));
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      {isAuthenticated ? (
        <div className="flex flex-1 flex-col bg-black text-white items-center text-center justify-center p-4">
          <h1 className="text-3xl">Welcome to , {user?.name}!</h1>
          <p>This is the home page content.</p>
          <p>Currently being worked on please be patient! Thank you!</p>
          <button
            onClick={logout}
            className="bg-orange-600 m-5 rounded-lg text-white px-4 py-2 hover:bg-orange-700 transition duration-200"
          >
            Logout
          </button>
          <div className="w-full max-w-md mx-auto p-4 border bg-gray-600 text-white rounded-lg shadow-lg">
            <h2 className="text-2x1">Favorite Food Entries</h2>
            <ul className="list-disc pl-5">
              {entries.map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  {entry.food} - {entry.carb}g carbs
                  <button
                    onClick={() => handleDeleteFavoriteEntry(index)}
                    className="m1-4 bg-red-500 text-white rounded-lg px-2 py-1 hover:bg-red-700 transition duration-200"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <h2>You are not logged in.</h2>
        </div>
      )}
    </div>
  );
};
