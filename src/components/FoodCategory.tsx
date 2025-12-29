import { useState, useCallback } from "react";

// Define categories as a constant outside the component for reusability
export const FOOD_CATEGORIES = [
  "Fruits",
  "Grains",
  "Dairy",
  "Vegetables",
  "Protein",
  "Sugars",
  "Other",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

interface CategorySelectionBoxProps {
  onSelectCategory: (category: string) => void;
  onClose: () => void;
}

export const CategorySelectionBox = ({
  onSelectCategory,
  onClose,
}: CategorySelectionBoxProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      onSelectCategory(category);
    },
    [onSelectCategory]
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, category: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCategoryClick(category);
      }
    },
    [handleCategoryClick]
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-dialog-title"
    >
      <div className="bg-gray-600 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2
          id="category-dialog-title"
          className="text-xl font-semibold mb-4 text-white"
        >
          Select a Category
        </h2>
        <ul className="space-y-2" role="listbox">
          {FOOD_CATEGORIES.map((category) => (
            <li
              key={category}
              role="option"
              aria-selected={selectedCategory === category}
            >
              <button
                onClick={() => handleCategoryClick(category)}
                onKeyDown={(e) => handleKeyDown(e, category)}
                className={`block w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                  selectedCategory === category
                    ? "bg-gray-300 text-black font-semibold"
                    : "bg-gray-700 text-white hover:bg-gray-500"
                }`}
                aria-label={`Select ${category} category`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={handleClose}
          className="mt-6 bg-red-500 text-white rounded-lg px-6 py-2 w-full hover:bg-red-700 transition-colors duration-200 font-semibold"
          aria-label="Close category selection dialog"
        >
          Close
        </button>
      </div>
    </div>
  );
};
