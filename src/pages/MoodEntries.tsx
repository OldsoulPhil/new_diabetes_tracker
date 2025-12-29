import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { MoodEntry } from "../types/types";
import { format } from "date-fns";
import { Requests } from "../api";

export const MoodEntries = () => {
  const { user, setUser } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const moodEmojis: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    excited: "😄",
    mad: "😠",
    angry: "😡",
    tired: "😴",
    stressed: "😰",
    neutral: "😐",
    anxious: "😨",
    calm: "😌",
    frustrated: "😤",
    content: "🙂",
    energetic: "⚡",
    overwhelmed: "😵",
    peaceful: "☮",
    motivated: "💪",
  };

  // Fetch mood entries from API
  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await Requests.getMoodEntries();
      if (Array.isArray(data)) {
        setEntries(data as MoodEntry[]);
      }
    } catch (error) {
      console.error("Failed to fetch mood entries:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    // Listen for moodEntryAdded event to refresh entries
    const handler = () => fetchEntries();
    window.addEventListener("moodEntryAdded", handler);
    return () => {
      window.removeEventListener("moodEntryAdded", handler);
    };
  }, [fetchEntries]);

  // Also sync with user state
  useEffect(() => {
    if (user?.moodEntries) {
      setEntries(user.moodEntries);
    }
  }, [user?.moodEntries]);

  const handleDeleteMoodEntry = useCallback(
    async (index: number) => {
      const entryToDelete = entries[index];
      if (!entryToDelete?.id) return;

      try {
        // Delete from API
        await Requests.deleteMoodEntry(entryToDelete.id);

        // Update local state
        const updatedEntries = entries.filter((_, i) => i !== index);
        setEntries(updatedEntries);

        // Update user context
        if (user) {
          setUser({
            ...user,
            moodEntries: updatedEntries,
          });
        }
      } catch (error) {
        console.error("Failed to delete mood entry:", error);
        alert("Failed to delete mood entry. Please try again.");
      }
    },
    [entries, user, setUser]
  );

  const getMoodLabel = (mood: string) => {
    return mood.charAt(0).toUpperCase() + mood.slice(1);
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-black text-white items-center justify-start p-2 md:p-4 overflow-auto pt-20 md:pt-4 md:ml-60">
        <div className="w-full max-w-4xl space-y-4">
          {/* Header */}
          <div className="p-3 md:p-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
              <span className="text-3xl">🧠</span>
              Mood Tracker History
            </h1>
            <p className="text-sm text-gray-300 mt-2">
              Track your emotional well-being and exercise habits
            </p>
          </div>

          {/* Mood Entries List */}
          <div className="p-3 md:p-4 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Your Mood Entries
            </h2>

            {isLoading ? (
              <p className="text-center text-gray-300">Loading...</p>
            ) : entries.length === 0 ? (
              <p className="text-center text-gray-300">
                No mood entries yet. Add one from the Mood Tracker page!
              </p>
            ) : (
              <ul className="space-y-3 max-h-[600px] overflow-auto">
                {entries.map((entry, index) => (
                  <li
                    key={entry.id || index}
                    className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        {/* Mood and Exercise */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-4xl">
                            {moodEmojis[entry.mood] || "😐"}
                          </span>
                          <div>
                            <span className="font-semibold text-lg">
                              {getMoodLabel(entry.mood)}
                            </span>
                            {entry.hoursWorkedOut > 0 && (
                              <span className="ml-3 text-sm bg-green-600 px-2 py-1 rounded">
                                💪 {entry.hoursWorkedOut}h
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        {entry.notes && (
                          <p className="text-sm text-gray-300 mb-2 italic">
                            "{entry.notes}"
                          </p>
                        )}

                        {/* Timestamp */}
                        <span className="text-xs text-gray-400">
                          {format(new Date(entry.timestamp), "PPpp")}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteMoodEntry(index)}
                        className="bg-red-500 text-white rounded-lg px-3 py-2 hover:bg-red-700 transition duration-200 text-sm shrink-0"
                        aria-label="Delete entry"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Statistics Summary */}
          {entries.length > 0 && (
            <div className="p-4 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="bg-purple-800 p-3 rounded-lg">
                  <div className="text-2xl font-bold">{entries.length}</div>
                  <div className="text-xs text-gray-300">Total Entries</div>
                </div>
                <div className="bg-purple-800 p-3 rounded-lg">
                  <div className="text-2xl font-bold">
                    {entries
                      .reduce((sum, e) => sum + e.hoursWorkedOut, 0)
                      .toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-300">Total Hours</div>
                </div>
                <div className="bg-purple-800 p-3 rounded-lg">
                  <div className="text-2xl font-bold">
                    {
                      entries.filter((e) =>
                        ["happy", "excited"].includes(e.mood)
                      ).length
                    }
                  </div>
                  <div className="text-xs text-gray-300">Positive Moods</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
