import { useState } from "react";
import { CategorySelectionBoxProps } from "../types/types";

const categories = [
  "Fruits",
  "Grains",
  "Dairy",
  "Vegetables",
  "Protein",
  "Sugars",
  "None",
];

export const CategorySelectionBox = ({
  onSelectCategory,
  onClose,
}: CategorySelectionBoxProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    onSelectCategory(category);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-600 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl mb-4">Select a Category</h2>
        <ul>
          {categories.map((category) => (
            <li key={category}>
              <button
                onClick={() => handleCategoryClick(category)}
                className={`block w-full text-left p-2 hover:bg-gray-400 rounded-lg ${
                  selectedCategory === category ? "bg-gray-300" : ""
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};
