import { useState, FormEvent } from "react";
import { GlucoseEntry } from "../types/types";

export const DiabetesTracker = () => {
  const [glucose, setGlucose] = useState<string>("");
  const [entries, setEntries] = useState<GlucoseEntry[]>([]);
  const [typingGlucose, setTypingGlucose] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (glucose) {
      const newEntry: GlucoseEntry = { glucose };
      setEntries([...entries, newEntry]);
      setGlucose("");
      setTypingGlucose("");
    }
  };

  const handleDelete = (index: number) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
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
        <ul className="list-disc pl-5">
          {entries.map((entry, index) => (
            <li key={index} className="flex justify-between items-center">
              {entry.glucose} mg/dL
              <button
                onClick={() => handleDelete(index)}
                className="ml-4 bg-red-500 text-white rounded-lg px-2 py-1 hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
