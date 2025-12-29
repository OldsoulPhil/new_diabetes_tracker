import { useState, useEffect, useCallback, useMemo } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { FoodEntry } from "../types/types";
import { CategorySelectionBox } from "../components/FoodCategory";
import { Requests } from "../api";
import { format } from "date-fns";
import {
  filterEntriesByCategory,
  groupEntriesByCategory,
} from "../utils/statsCalculators";

export const FavoriteFood = () => {
  const { user, setUser } = useAuth();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [focusedEntry, setFocusedEntry] = useState<FoodEntry | null>(null);
  const [showCategoryBox, setShowCategoryBox] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Fetch all food entries
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setIsLoading(true);
        const allEntries = await Requests.getFoodEntries();
        setEntries(allEntries as FoodEntry[]);
      } catch (error) {
        console.error("Failed to fetch foods:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoods();
  }, []);

  // Also sync with user state
  useEffect(() => {
    if (user?.foodEntries) {
      setEntries(user.foodEntries);
    }
  }, [user?.foodEntries]);

  const handleDeleteFavoriteEntry = useCallback(
    async (entryId: number) => {
      try {
        await Requests.deleteFoodEntry(entryId);

        const updatedEntries = entries.filter((entry) => entry.id !== entryId);
        setEntries(updatedEntries.map((e) => e as FoodEntry));

        if (user) {
          const updatedUserEntries =
            user.foodEntries?.filter((entry) => entry.id !== entryId) || [];
          setUser({
            ...user,
            foodEntries: updatedUserEntries.map((e) => e as FoodEntry),
          });
        }
      } catch (error) {
        console.error("Failed to delete favorite entry:", error);
      }
    },
    [entries, user, setUser]
  );

  const handleFocusEntry = useCallback((entry: FoodEntry) => {
    setFocusedEntry(entry);
    setShowCategoryBox(true);
  }, []);

  const handleSelectCategory = useCallback(
    async (category: string) => {
      if (!focusedEntry?.id) return;

      try {
        const updatedEntry = await Requests.updateFoodEntry(focusedEntry.id, {
          category: category === "None" ? undefined : category,
        });

        const updatedEntries = entries.map((entry) =>
          entry.id === focusedEntry.id ? updatedEntry : entry
        );
        setEntries(updatedEntries);

        if (user) {
          const updatedUserEntries =
            user.foodEntries?.map((entry) =>
              entry.id === focusedEntry.id ? updatedEntry : entry
            ) || [];
          setUser({ ...user, foodEntries: updatedUserEntries });
        }

        setShowCategoryBox(false);
        setFocusedEntry(null);
      } catch (error) {
        console.error("Failed to update category:", error);
      }
    },
    [focusedEntry, entries, user, setUser]
  );

  const handleCloseCategoryBox = useCallback(() => {
    setShowCategoryBox(false);
    setFocusedEntry(null);
  }, []);

  const categories = [
    "All",
    "Fruits",
    "Grains",
    "Dairy",
    "Vegetables",
    "Protein",
    "Sugars",
    "Other",
  ];

  const filteredEntries = useMemo(() => {
    return filterEntriesByCategory(entries, selectedCategory);
  }, [entries, selectedCategory]);

  const groupedEntries = useMemo(() => {
    return groupEntriesByCategory(filteredEntries);
  }, [filteredEntries]);

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-black text-white items-center justify-start p-2 md:p-4 overflow-auto pt-20 md:pt-4 md:ml-60">
        <div className="w-full max-w-4xl">
          <div className="p-4 md:p-6 bg-gray-600 rounded-lg shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              Food Categories
            </h2>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold transition text-sm md:text-base ${
                    selectedCategory === category
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {isLoading ? (
              <p className="text-center text-gray-300">Loading...</p>
            ) : filteredEntries.length === 0 ? (
              <p className="text-center text-gray-300">
                No{" "}
                {selectedCategory === "All" ? "food entries" : selectedCategory}{" "}
                found. Add some entries from the Home page!
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedEntries).map(
                  ([category, categoryEntries]) => (
                    <div key={category} className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold mb-3 text-orange-400">
                        {category}
                      </h3>
                      <ul className="space-y-2">
                        {categoryEntries.map((entry) => (
                          <li
                            key={entry.id}
                            className={`flex flex-col p-3 rounded transition ${
                              entry.favorite
                                ? "bg-yellow-900/20 border border-yellow-600"
                                : focusedEntry?.id === entry.id
                                ? "bg-gray-600"
                                : "bg-gray-800 hover:bg-gray-600"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <button
                                onClick={() => handleFocusEntry(entry)}
                                className="flex-1 text-left"
                              >
                                {entry.favorite && (
                                  <span className="mr-2 text-yellow-400">
                                    ⭐
                                  </span>
                                )}
                                <span
                                  className={`font-medium ${
                                    entry.favorite ? "text-yellow-200" : ""
                                  }`}
                                >
                                  {entry.food}
                                </span>
                                <span className="text-gray-400">
                                  {" "}
                                  - {entry.carb}g carbs
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteFavoriteEntry(entry.id!)
                                }
                                className="ml-4 bg-red-500 text-white rounded-lg px-3 py-1 hover:bg-red-700 transition text-sm"
                                aria-label="Delete favorite"
                              >
                                Remove
                              </button>
                            </div>
                            {entry.timestamp && (
                              <div className="mt-2 text-xs text-gray-400">
                                Added:{" "}
                                {format(new Date(entry.timestamp), "PPpp")}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCategoryBox && focusedEntry && (
        <CategorySelectionBox
          onSelectCategory={handleSelectCategory}
          onClose={handleCloseCategoryBox}
        />
      )}
    </div>
  );
};
