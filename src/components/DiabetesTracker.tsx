import { useState, useCallback, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { Requests } from "../api";

interface DiabetesTrackerProps {
  onEntryAdded?: () => void;
}

export const DiabetesTracker = ({ onEntryAdded }) => {
  const { user, setUser } = useAuth();
  const [glucose, setGlucose] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");

      const glucoseValue = Number(glucose);
      if (!glucoseValue || glucoseValue <= 0) {
        setError("Please enter a valid glucose level");
        return;
      }

      setIsSubmitting(true);
      try {
        const newEntry = await Requests.createGlucoseEntry(glucoseValue);

        // Update user state with new entry
        if (user) {
          setUser({
            ...user,
            glucoseEntries: [...(user.glucoseEntries || []), newEntry],
          });
        }

        setGlucose("");
        onEntryAdded?.();
      } catch (err: any) {
        console.error("Failed to add glucose entry:", err);
        setError(err.response?.data?.error || "Failed to add entry");
      } finally {
        setIsSubmitting(false);
      }
    },
    [glucose, user, setUser, onEntryAdded]
  );

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setGlucose(e.target.value);
    setError("");
  }, []);

  return (
    <div className="w-full p-4 border bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-3">Glucose Tracker</h2>

      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          type="number"
          placeholder="Glucose Level (mg/dL)"
          value={glucose}
          onChange={handleInputChange}
          className="border rounded-lg p-2 mb-2 text-black text-sm"
          min="1"
          max="600"
          required
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="bg-orange-600 rounded-lg px-4 py-1.5 text-sm hover:bg-orange-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Entry"}
        </button>
      </form>

      {glucose && (
        <div className="mt-3 text-sm text-gray-300">
          Current: {glucose} mg/dL
        </div>
      )}
    </div>
  );
};
