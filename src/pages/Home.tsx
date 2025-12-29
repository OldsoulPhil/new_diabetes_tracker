import { useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { DiabetesTracker } from "../components/DiabetesTracker";
import { FoodEntryItem } from "../components/FoodEntry";
import { MoodTracker } from "../components/MoodTracker";

export const Home = () => {
  const { user, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout]);

  const handleEntryAdded = useCallback(() => {
    // Refresh or update UI if needed
    console.log("Entry added successfully");
  }, []);

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-black text-white items-center justify-start p-4 md:p-6 pt-20 md:pt-4 flex-grow md:ml-60">
        <div className="text-center mb-4 md:mb-6 w-full max-w-6xl">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-sm md:text-base text-gray-400 mb-3">
            Track your diabetes data here
          </p>
          <button
            onClick={handleLogout}
            className="bg-orange-600 rounded-lg text-white px-4 py-2 md:px-6 md:py-2 hover:bg-orange-700 transition duration-200 text-sm md:text-base"
          >
            Logout
          </button>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <DiabetesTracker onEntryAdded={handleEntryAdded} />
            <FoodEntryItem onEntryAdded={handleEntryAdded} />
          </div>
          <MoodTracker onEntryAdded={handleEntryAdded} />
        </div>
      </div>
    </div>
  );
};
