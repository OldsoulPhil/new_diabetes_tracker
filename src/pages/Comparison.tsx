import { useState, useCallback, useMemo, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { FoodEntry, GlucoseEntry } from "../types/types";
import GlucoseChart from "../components/GlucoseChart";
import { Requests } from "../api";
import { calculateUserStats } from "../utils/statsCalculators";

interface AnonymousUserData {
  anonymousId: string;
  index: number;
  glucoseEntries: GlucoseEntry[];
  foodEntries: FoodEntry[];
  stats: {
    totalGlucoseEntries: number;
    totalFoodEntries: number;
    averageGlucose: string;
  };
}

interface AnonymousUserListItem {
  index: number;
  label: string;
}

export const Comparison = () => {
  const { user } = useAuth();
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUserData | null>(
    null
  );
  const [anonymousUserList, setAnonymousUserList] = useState<
    AnonymousUserListItem[]
  >([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPrivacyNotice, setShowPrivacyNotice] = useState<boolean>(() => {
    // Check sessionStorage to see if notice was dismissed this session
    const dismissed = sessionStorage.getItem(
      "comparisonPrivacyNoticeDismissed"
    );
    return dismissed !== "true";
  });

  // Handle privacy notice dismissal
  const handleDismissPrivacyNotice = useCallback(() => {
    sessionStorage.setItem("comparisonPrivacyNoticeDismissed", "true");
    setShowPrivacyNotice(false);
  }, []);

  // Fetch list of anonymous users on mount
  useEffect(() => {
    const fetchAnonymousUserList = async () => {
      try {
        console.log("Fetching anonymous user list...");
        const data = await Requests.getAnonymousUserList();
        console.log("Anonymous user list response:", data);
        if (
          typeof data === "object" &&
          data !== null &&
          "users" in data &&
          Array.isArray((data as any).users)
        ) {
          setAnonymousUserList(
            (data as { users: AnonymousUserListItem[] }).users
          );
        }
      } catch (err: any) {
        console.error("Failed to load anonymous user list:", err);
        console.error("Error response:", err.response?.data);
      }
    };

    fetchAnonymousUserList();
  }, []);

  const handleUserSelection = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const index = e.target.value;
      setSelectedUserIndex(index);

      if (index === "") {
        setAnonymousUser(null);
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const data = await Requests.getAnonymousUserByIndex(parseInt(index));
        if (typeof data === "object" && data !== null) {
          setAnonymousUser(data as AnonymousUserData);
        }
      } catch (err: any) {
        console.error("Failed to load anonymous user:", err);
        setError(
          err.response?.data?.error ||
            "Failed to load anonymous user. Please try again."
        );
        setAnonymousUser(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Calculate user's stats
  const userStats = useMemo(() => {
    if (!user) return null;
    return calculateUserStats(user.glucoseEntries, user.foodEntries);
  }, [user]);

  // Chart data for comparison

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-black text-white items-center justify-start p-2 md:p-4 overflow-auto pt-20 md:pt-4 md:ml-60">
        <div className="w-full max-w-6xl">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center">
            Anonymous Data Comparison
          </h1>

          {/* Privacy Notice */}
          {showPrivacyNotice && (
            <div className="bg-blue-900 text-white p-4 rounded-lg mb-6 relative">
              <button
                onClick={handleDismissPrivacyNotice}
                className="absolute top-2 right-2 text-white hover:text-gray-300 text-xl font-bold w-8 h-8 flex items-center justify-center"
                aria-label="Close privacy notice"
              >
                ×
              </button>
              <h3 className="font-semibold mb-2 flex items-center">
                🔒 Privacy Protected
              </h3>
              <p className="text-sm">
                Compare your data with anonymous users. No personal information
                is shared. Select a user from the dropdown below.
              </p>
            </div>
          )}

          {/* Anonymous User Selector */}
          <div className="bg-gray-600 p-4 md:p-6 rounded-lg shadow-lg mb-6">
            <label
              htmlFor="anonymousUserSelect"
              className="block text-lg font-semibold mb-3 text-gray-200"
            >
              Select Anonymous User
            </label>
            <div className="relative">
              <select
                id="anonymousUserSelect"
                value={selectedUserIndex}
                onChange={handleUserSelection}
                disabled={isLoading || anonymousUserList.length === 0}
                className="w-full bg-gray-700 text-white border-2 border-gray-500 rounded-lg px-4 py-3 pr-10 text-base font-medium 
                         appearance-none cursor-pointer
                         hover:border-orange-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
              >
                <option value="" className="bg-gray-800">
                  {anonymousUserList.length === 0
                    ? "No users available"
                    : "Choose a user to compare..."}
                </option>
                {anonymousUserList.map((user) => (
                  <option
                    key={user.index}
                    value={user.index}
                    className="bg-gray-800 py-2"
                  >
                    {user.label}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-orange-500">
                <svg
                  className="fill-current h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {isLoading && (
              <div className="mt-3 text-center text-orange-400 font-medium">
                Loading user data...
              </div>
            )}
            {error && (
              <div className="mt-4 bg-red-500 text-white p-3 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Comparison Stats */}
          {anonymousUser && userStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Your Stats */}
              <div className="bg-gray-600 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-purple-400">
                  Your Stats
                </h2>
                <div className="space-y-3">
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-2xl font-bold text-white">
                      {userStats.totalGlucoseEntries}
                    </p>
                    <p className="text-gray-300 text-sm">Glucose Entries</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-2xl font-bold text-white">
                      {userStats.averageGlucose} mg/dL
                    </p>
                    <p className="text-gray-300 text-sm">Average Glucose</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-2xl font-bold text-white">
                      {userStats.totalFoodEntries}
                    </p>
                    <p className="text-gray-300 text-sm">Food Entries</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-2xl font-bold text-white">
                      {userStats.favoriteFoods}
                    </p>
                    <p className="text-gray-300 text-sm">Favorite Foods</p>
                  </div>
                </div>
              </div>

              {/* Anonymous User Stats */}
              <div className="bg-gray-600 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-orange-400">
                  {anonymousUser.anonymousId}'s Stats
                </h2>
                <div className="space-y-3">
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-2xl font-bold text-white">
                      {anonymousUser.stats.totalGlucoseEntries}
                    </p>
                    <p className="text-gray-300 text-sm">Glucose Entries</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-2xl font-bold text-white">
                      {anonymousUser.stats.averageGlucose} mg/dL
                    </p>
                    <p className="text-gray-300 text-sm">Average Glucose</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-2xl font-bold text-white">
                      {anonymousUser.stats.totalFoodEntries}
                    </p>
                    <p className="text-gray-300 text-sm">Food Entries</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-2xl font-bold text-white">
                      {
                        anonymousUser.foodEntries.filter((e) => e.favorite)
                          .length
                      }
                    </p>
                    <p className="text-gray-300 text-sm">Favorite Foods</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Glucose Chart Comparison */}
          {anonymousUser &&
            user?.glucoseEntries &&
            user.glucoseEntries.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Your Glucose Chart */}
                <div className="bg-gray-600 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl md:text-2xl font-semibold mb-4 text-purple-400">
                    Your Glucose Data
                  </h2>
                  <GlucoseChart entries={user.glucoseEntries} />
                </div>

                {/* Anonymous User's Glucose Chart */}
                <div className="bg-gray-600 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl md:text-2xl font-semibold mb-4 text-orange-400">
                    {anonymousUser.anonymousId}'s Glucose Data
                  </h2>
                  <GlucoseChart entries={anonymousUser.glucoseEntries} />
                </div>
              </div>
            )}

          {/* Show current user's data only if no comparison loaded */}
          {!anonymousUser &&
            user?.glucoseEntries &&
            user.glucoseEntries.length > 0 && (
              <div className="bg-gray-600 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">
                  Your Glucose Data
                </h2>
                <GlucoseChart entries={user.glucoseEntries} />
              </div>
            )}

          {!anonymousUser &&
            (!user?.glucoseEntries || user.glucoseEntries.length === 0) && (
              <div className="bg-gray-600 p-6 rounded-lg shadow-lg">
                <p className="text-center text-gray-300 py-8">
                  No glucose data available. Add some entries from the Home
                  page, then select an anonymous user to compare!
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
