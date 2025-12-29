import { GlucoseEntry, FoodEntry } from "../types/types";

/**
 * Calculate average glucose from entries
 */
export const calculateAverageGlucose = (
  entries: GlucoseEntry[] | undefined
): string => {
  if (!entries || entries.length === 0) return "0";

  const sum = entries.reduce((acc, entry) => acc + entry.glucose, 0);
  return (sum / entries.length).toFixed(1);
};

/**
 * Calculate user statistics
 */
export const calculateUserStats = (
  glucoseEntries: GlucoseEntry[] | undefined,
  foodEntries: FoodEntry[] | undefined
) => {
  return {
    totalGlucoseEntries: glucoseEntries?.length || 0,
    totalFoodEntries: foodEntries?.length || 0,
    favoriteFoods: foodEntries?.filter((e) => e.favorite).length || 0,
    averageGlucose: calculateAverageGlucose(glucoseEntries),
  };
};

/**
 * Filter entries by category
 */
export const filterEntriesByCategory = (
  entries: FoodEntry[],
  category: string
): FoodEntry[] => {
  if (category === "All") return entries;

  if (category === "Other") {
    return entries.filter(
      (entry) =>
        !entry.category ||
        entry.category === "Other" ||
        entry.category === "None"
    );
  }

  return entries.filter((entry) => entry.category === category);
};

/**
 * Group entries by category
 */
export const groupEntriesByCategory = (
  entries: FoodEntry[]
): Record<string, FoodEntry[]> => {
  return entries.reduce((acc, entry) => {
    const category = entry.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);
};
