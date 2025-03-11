import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { GlucoseEntry } from "../types/types"; // Import GlucoseEntry type
import { format } from "date-fns"; // Import format from date-fns
import GlucoseChart from "../components/GlucoseChart"; // Import GlucoseChart

export const GlucoseEntries = () => {
  const { isAuthenticated, user, updateUserData } = useAuth();
  const [entries, setEntries] = useState<GlucoseEntry[]>([]); // Add type for entries
  const [currentTime, setCurrentTime] = useState(new Date()); // Add state for current time

  useEffect(() => {
    if (user) {
      const storedUser = JSON.parse(localStorage.getItem(user.email) || "{}");
      const storedEntries = storedUser.glucoseEntries || [];
      setEntries(storedEntries);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && user.glucoseEntries) {
      setEntries(user.glucoseEntries);
    }
  }, [user]);

  const handleDeleteGlucoseEntry = (index: number) => {
    if (user) {
      const updatedGlucoseEntries = (user.glucoseEntries || []).filter(
        (_, i) => i !== index
      );
      const updatedUser = { ...user, glucoseEntries: updatedGlucoseEntries };
      updateUserData(updatedUser);
      setEntries(updatedGlucoseEntries);
      const storedUser = JSON.parse(localStorage.getItem(user.email) || "{}");
      storedUser.glucoseEntries = updatedGlucoseEntries;
      localStorage.setItem(user.email, JSON.stringify(storedUser));
    } else {
      const updatedEntries = entries.filter((_, i) => i !== index);
      setEntries(updatedEntries);
      localStorage.setItem("glucoseEntries", JSON.stringify(updatedEntries));
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      {isAuthenticated ? (
        <div className="flex flex-1 flex-col bg-black text-white items-center text-center justify-start p-4">
          <div className="flex-1 overflow-auto w-full">
            <div className="w-full max-w-md mx-auto p-4 border bg-gray-600 text-white rounded-lg shadow-lg mb-4">
              <h2 className="text-2xl">
                Current Time: {format(currentTime, "PPpp")}
              </h2>{" "}
            </div>
            <div className="w-full max-w-md mx-auto p-4 border bg-gray-600 text-white rounded-lg shadow-lg">
              <h2 className="text-2xl">Glucose Entries</h2>{" "}
              <ul className="list-disc pl-5 overflow-auto max-h-96">
                {entries.map((entry, index) => (
                  <li
                    key={index}
                    className={`flex justify-between items-center p-2`}
                  >
                    {entry.glucose} mg/dL -{" "}
                    {format(new Date(entry.timestamp), "PPpp")}
                    <button
                      onClick={() => handleDeleteGlucoseEntry(index)}
                      className="ml-4 bg-red-500 text-white rounded-lg px-2 py-1 hover:bg-red-700 transition duration-200"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full max-w-4xl mx-auto p-4 border bg-gray-600 text-white rounded-lg shadow-lg mt-4">
              <GlucoseChart entries={entries} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center p-4"></div>
      )}
    </div>
  );
};
