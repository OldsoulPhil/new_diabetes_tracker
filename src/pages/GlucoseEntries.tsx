import { useState, useEffect, useCallback, useMemo } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { GlucoseEntry } from "../types/types";
import { format } from "date-fns";
import GlucoseChart from "../components/GlucoseChart";
import { Requests } from "../api";

export const GlucoseEntries = () => {
  const { user, setUser } = useAuth();
  const [entries, setEntries] = useState<GlucoseEntry[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch glucose entries from API
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        const data = await Requests.getGlucoseEntries();
        setEntries(data);
      } catch (error) {
        console.error("Failed to fetch glucose entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Also sync with user state
  useEffect(() => {
    if (user?.glucoseEntries) {
      setEntries(user.glucoseEntries);
    }
  }, [user?.glucoseEntries]);

  const handleDeleteGlucoseEntry = useCallback(
    async (index: number) => {
      const entryToDelete = entries[index];
      if (!entryToDelete?.id) return;

      try {
        // Delete from API
        await Requests.deleteGlucoseEntry(entryToDelete.id);

        // Update local state
        const updatedEntries = entries.filter((_, i) => i !== index);
        setEntries(updatedEntries);

        // Update user context
        if (user) {
          setUser({
            ...user,
            glucoseEntries: updatedEntries,
          });
        }
      } catch (error) {
        console.error("Failed to delete glucose entry:", error);
        alert("Failed to delete glucose entry. Please try again.");
      }
    },
    [entries, user, setUser]
  );

  const formattedTime = useMemo(() => {
    return format(currentTime, "PPpp");
  }, [currentTime]);

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-black text-white items-center justify-start p-2 md:p-4 overflow-auto pt-20 md:pt-4 md:ml-60">
        <div className="w-full max-w-4xl space-y-4">
          {/* Current Time Display */}
          <div className="p-3 md:p-4 bg-gray-600 rounded-lg shadow-lg text-center">
            <h2 className="text-lg md:text-2xl font-semibold">
              Current Time: {formattedTime}
            </h2>
          </div>

          {/* Glucose Entries List */}
          <div className="p-3 md:p-4 bg-gray-600 rounded-lg shadow-lg">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Glucose Entries
            </h2>

            {isLoading ? (
              <p className="text-center text-gray-300">Loading...</p>
            ) : entries.length === 0 ? (
              <p className="text-center text-gray-300">
                No glucose entries yet. Add one from the Home page!
              </p>
            ) : (
              <ul className="space-y-2 max-h-96 overflow-auto">
                {entries
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .slice(0, 5)
                  .map((entry, index) => (
                    <li
                      key={entry.id || index}
                      className="flex justify-between items-center p-3 bg-gray-700 rounded hover:bg-gray-600 transition"
                    >
                      <span>
                        <span className="font-semibold">
                          {entry.glucose} mg/dL
                        </span>
                        {" - "}
                        <span className="text-sm text-gray-300">
                          {format(new Date(entry.timestamp), "PPpp")}
                        </span>
                      </span>
                      <button
                        onClick={() => handleDeleteGlucoseEntry(index)}
                        className="bg-red-500 text-white rounded-lg px-3 py-1 hover:bg-red-700 transition duration-200 text-sm"
                        aria-label="Delete entry"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Glucose Chart */}
          {entries.length > 0 && (
            <div className="p-4 bg-gray-600 rounded-lg shadow-lg">
              <GlucoseChart entries={entries} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
