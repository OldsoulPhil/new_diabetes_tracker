import { useState, FormEvent } from "react";
import { FoodEntry } from "../types/types";

interface FoodEntryItemProps {
  onAddEntry: (entry: FoodEntry) => void;
  userId: string;
}

export const FoodEntryItem = ({ onAddEntry, userId }: FoodEntryItemProps) => {
  const [food, setFood] = useState<string>("");
  const [carb, setCarb] = useState<string>("");
  const [typingFood, setTypingFood] = useState<string>("");
  const [typingCarb, setTypingCarb] = useState<string>("");
  const [favorite, setFavorite] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (food && carb) {
      const newEntry: FoodEntry = { food, carb, userId, favorite };
      onAddEntry(newEntry);
      setFood("");
      setCarb("");
      setTypingFood("");
      setTypingCarb("");
      setFavorite(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border bg-gray-600 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl mb-4">Food Entry Tracker</h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          type="text"
          placeholder="Food Item"
          value={food}
          onChange={(e) => {
            setFood(e.target.value);
            setTypingFood(e.target.value);
          }}
          className="border rounded-lg p-2 mb-2 text-black"
          required
        />
        <input
          type="number"
          placeholder="Carbohydrates (g)"
          value={carb}
          onChange={(e) => {
            setCarb(e.target.value);
            setTypingCarb(e.target.value);
          }}
          className="border rounded-lg p-2 mb-2 text-black"
          required
        />
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
            className="mr-2"
          />
          Favorite
        </label>
        <button
          type="submit"
          className="bg-orange-600 text-white rounded-lg px-4 py-2 hover:bg-orange-700 transition duration-200"
        >
          Add Entry
        </button>
      </form>
      <div className="mt-4">
        <h3 className="text-xl">
          Entry: {typingFood && `${typingFood} - ${typingCarb}g (carbs)`}
        </h3>
      </div>
    </div>
  );
};
