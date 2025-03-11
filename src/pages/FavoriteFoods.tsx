import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { FoodEntry } from "../types/types";
import { CategorySelectionBox } from "../components/FoodCategory";

export const FavoriteFood = () => {
  const { isAuthenticated, user, updateUserData } = useAuth();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [focusedEntry, setFocusedEntry] = useState<FoodEntry | null>(null);
  const [showCategoryBox, setShowCategoryBox] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (isAuthenticated && user) {
      const favorites = (user.foodEntries || []).filter(
        (entry) => entry.favorite
      );
      setEntries(favorites);
      const categories = (user.foodEntries || []).reduce((acc, entry) => {
        if (entry.category && entry.category !== "None") {
          acc[entry.food] = entry.category;
        }
        return acc;
      }, {} as { [key: string]: string });
      setSelectedCategories(categories);
    }
  }, [isAuthenticated, user]);

  const handleDeleteFavoriteEntry = (index: number) => {
    if (user) {
      const updatedFoodEntries = (user.foodEntries || []).filter(
        (entry) => !(entry.favorite && entries.indexOf(entry) === index)
      );
      const updatedUser = { ...user, foodEntries: updatedFoodEntries };
      updateUserData(updatedUser);
      setEntries(updatedFoodEntries.filter((entry) => entry.favorite));
    }
  };

  const handleFocusEntry = (entry: FoodEntry) => {
    setFocusedEntry(entry);
    setShowCategoryBox(true);
  };

  const handleSelectCategory = (category: string) => {
    if (focusedEntry && user) {
      const updatedEntry = { ...focusedEntry, category };
      const updatedEntries = entries.map((entry) =>
        entry === focusedEntry ? updatedEntry : entry
      );
      const updatedUserEntries = (user.foodEntries || []).map((entry) =>
        entry.food === focusedEntry.food ? updatedEntry : entry
      );
      const updatedUser = { ...user, foodEntries: updatedUserEntries };
      updateUserData(updatedUser);
      setEntries(updatedEntries);
      setFocusedEntry(null);
      setShowCategoryBox(false);
      setSelectedCategories((prev) => ({
        ...prev,
        [focusedEntry.food]: category,
      }));
    }
  };

  const handleCloseCategoryBox = () => {
    setShowCategoryBox(false);
    setFocusedEntry(null);
  };

  const groupedEntries = entries.reduce((acc, entry) => {
    const category = selectedCategories[entry.food] || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(entry);
    return acc;
  }, {} as { [key: string]: FoodEntry[] });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {isAuthenticated ? (
        <div className="flex flex-1 flex-col bg-black text-white items-center text-center justify-start p-4">
          <div className="flex-1 overflow-auto w-full">
            <div className="w-full max-w-md mx-auto p-4 border bg-gray-600 text-white rounded-lg shadow-lg mt-8 overflow-auto">
              <h2 className="text-2x1">Favorite Food Entries</h2>
              <ul className="list-disc pl-5 overflow-auto max-h-96">
                {entries.map((entry, index) => (
                  <li
                    key={index}
                    className={`flex justify-between items-center p-2 ${
                      focusedEntry === entry ? "bg-gray-500" : ""
                    }`}
                  >
                    <span onClick={() => handleFocusEntry(entry)}>
                      {entry.food} - {entry.carb}g carbs
                      {selectedCategories[entry.food] && (
                        <span className="ml-2 bg-orange-500 text-white rounded-lg px-2 py-1">
                          {selectedCategories[entry.food]}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => handleDeleteFavoriteEntry(index)}
                      className="ml-4 bg-red-500 text-white rounded-lg px-2 py-1 hover:bg-red-700 transition duration-200"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap justify-center mt-4">
              {Object.keys(groupedEntries).map((category) => (
                <div
                  key={category}
                  className="w-full max-w-md mx-2 p-4 border bg-gray-600 text-white rounded-lg shadow-lg mt-4"
                >
                  <h2 className="text-2x1">{category}</h2>
                  <ul className="list-disc list-none pl-5">
                    {groupedEntries[category].map((entry, index) => (
                      <li key={index} className="p-2">
                        {entry.food} - {entry.carb}g carbs
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {showCategoryBox && (
              <CategorySelectionBox
                onSelectCategory={handleSelectCategory}
                onClose={handleCloseCategoryBox}
              />
            )}
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
