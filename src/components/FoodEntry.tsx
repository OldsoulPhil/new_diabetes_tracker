import { useState, useCallback, FormEvent, ChangeEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { Requests } from "../api";

interface FoodEntryItemProps {
  onEntryAdded?: () => void;
}

export const FoodEntryItem = ({ onEntryAdded }: FoodEntryItemProps) => {
  const { user, setUser } = useAuth();
  const [food, setFood] = useState<string>("");
  const [carb, setCarb] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<string>("g");
  const [favorite, setFavorite] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("None");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const reset = useCallback(() => {
    setFood("");
    setCarb("");
    setWeight("");
    setWeightUnit("g");
    setFavorite(false);
    setCategory("None");
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");

      if (!food.trim() || !carb) {
        setError("Please fill in all fields");
        return;
      }

      setIsSubmitting(true);
      try {
        // Capture timestamp at the moment of submission
        const entryTimestamp = new Date().toISOString();

        const newEntry = await Requests.createFoodEntry({
          food: food.trim(),
          carb: Number(carb),
          weight: weight || undefined,
          weightUnit: weight ? weightUnit : undefined,
          favorite,
          category: category === "None" ? undefined : category,
          timestamp: entryTimestamp,
        });

        // Update user state with new entry
        if (user) {
          setUser({
            ...user,
            foodEntries: [...(user.foodEntries || []), newEntry as any],
          });
        }

        reset();
        onEntryAdded?.();
      } catch (err: any) {
        console.error("Failed to add food entry:", err);
        setError(err.response?.data?.error || "Failed to add entry");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      food,
      carb,
      weight,
      weightUnit,
      favorite,
      category,
      user,
      setUser,
      reset,
      onEntryAdded,
    ]
  );

  return (
    <div className="w-full p-4 border bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-3">Food Entry Tracker</h2>

      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          type="text"
          placeholder="Food Item"
          value={food}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFood(e.target.value)
          }
          className="border rounded-lg p-2 mb-2 text-black text-sm"
          maxLength={100}
          required
          disabled={isSubmitting}
        />
        <input
          type="number"
          placeholder="Carbohydrates (g)"
          value={carb}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setCarb(e.target.value)
          }
          className="border rounded-lg p-2 mb-2 text-black text-sm"
          min="0"
          max="1000"
          required
          disabled={isSubmitting}
        />

        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Weight (optional)"
            value={weight}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWeight(e.target.value)
            }
            className="border rounded-lg p-2 text-black flex-1 text-sm"
            min="0"
            step="0.01"
            disabled={isSubmitting}
          />
          {/* Mobile version - abbreviated */}
          <select
            value={weightUnit}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setWeightUnit(e.target.value)
            }
            className="sm:hidden border rounded-lg p-2 text-black w-20 text-xs"
            disabled={isSubmitting}
          >
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="oz">oz</option>
            <option value="lb">lbs</option>
            <option value="mg">mg</option>
            <option value="serving">srv</option>
            <option value="piece">pc</option>
            <option value="cup">cup</option>
            <option value="tbsp">tbsp</option>
            <option value="tsp">tsp</option>
            <option value="fl oz">fl oz</option>
            <option value="ml">ml</option>
            <option value="L">L</option>
          </select>
          {/* Desktop version - full names */}
          <select
            value={weightUnit}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setWeightUnit(e.target.value)
            }
            className="hidden sm:block border rounded-lg p-2 text-black text-sm"
            disabled={isSubmitting}
          >
            <option value="g">Grams (g)</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="oz">Ounces (oz)</option>
            <option value="lb">Pounds (lbs)</option>
            <option value="mg">Milligrams (mg)</option>
            <option value="serving">Serving</option>
            <option value="piece">Piece(s)</option>
            <option value="cup">Cup(s)</option>
            <option value="tbsp">Tablespoon (tbsp)</option>
            <option value="tsp">Teaspoon (tsp)</option>
            <option value="fl oz">Fluid Ounce (fl oz)</option>
            <option value="ml">Milliliter (ml)</option>
            <option value="L">Liter (L)</option>
          </select>
        </div>

        <select
          value={category}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setCategory(e.target.value)
          }
          className="border rounded-lg p-2 mb-2 text-black text-sm"
          disabled={isSubmitting}
        >
          <option value="None">No Category</option>
          <option value="Fruits">Fruits</option>
          <option value="Grains">Grains</option>
          <option value="Dairy">Dairy</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Protein">Protein</option>
          <option value="Sugars">Sugars</option>
        </select>

        <label className="flex items-center mb-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFavorite(e.target.checked)
            }
            className="mr-2"
            disabled={isSubmitting}
          />
          <span>Mark as Favorite</span>
        </label>

        <button
          type="submit"
          className="bg-orange-600 text-white rounded-lg px-4 py-1.5 text-sm hover:bg-orange-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Entry"}
        </button>
      </form>

      {food && (
        <div className="mt-3 text-sm text-gray-300">
          Preview: {food} - {carb}g carbs{weight && ` - ${weight}${weightUnit}`}{" "}
          {favorite && "⭐"}
        </div>
      )}
    </div>
  );
};
