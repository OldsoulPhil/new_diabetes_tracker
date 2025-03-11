import { useState, FormEvent } from "react";
import { GlucoseEntry } from "../types/types";
import { useAuth } from "../hooks/useAuth";
import { formatISO } from "date-fns"; // Import formatISO from date-fns

export const DiabetesTracker = () => {
  const { user, updateUserData } = useAuth(); // Use useAuth
  const [glucose, setGlucose] = useState<string>("");
  const [typingGlucose, setTypingGlucose] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (glucose && user) {
      const newEntry: GlucoseEntry = {
        glucose: Number(glucose), // Convert glucose to number
        userId: user.email,
        timestamp: formatISO(new Date()), // Set timestamp using formatISO
      }; // Add userId
      const updatedUser = {
        ...user,
        glucoseEntries: [...(user.glucoseEntries || []), newEntry],
      };
      updateUserData(updatedUser);

      // Save to localStorage
      const storedUser = JSON.parse(localStorage.getItem(user.email) || "{}");
      storedUser.glucoseEntries = [
        ...(storedUser.glucoseEntries || []),
        newEntry,
      ];
      localStorage.setItem(user.email, JSON.stringify(storedUser));

      setGlucose("");
      setTypingGlucose("");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border bg-gray-600 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl mb-4">Diabetes Number Tracker</h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          type="number"
          placeholder="Glucose Level (mg/dL)"
          value={glucose}
          onChange={(e) => {
            setGlucose(e.target.value);
            setTypingGlucose(e.target.value);
          }}
          className="border rounded-lg p-2 mb-2 text-black"
          required
        />
        <button
          type="submit"
          className="bg-orange-600 rounded-lg px-4 py-2 hover:bg-orange-700 transition duration-200"
        >
          Add Entry
        </button>
      </form>
      <div className="mt-4">
        <h3 className="text-xl">
          Entry: {typingGlucose && `${typingGlucose} (mg/dL)`}
        </h3>
      </div>
    </div>
  );
};
