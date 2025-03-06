import { UseFormRegister, FieldError } from "react-hook-form";

export interface FormData {
  name: string;
  email: string;
  password: string;
}

export type FormFieldProps = {
  label: string;
  id: keyof FormData;
  type: string;
  register: UseFormRegister<FormData>;
  error: FieldError | undefined;
  validation: { required: string };
};

export type ButtonProps = {
  type: "submit" | "button";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export interface User {
  email: string;
  name: string;
  foodEntries: FoodEntry[];
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUserData: (updatedUser: User) => void;
}

export interface GlucoseEntry {
  glucose: string;
}

export interface FoodEntry {
  food: string;
  carb: string;
  userId: string; // add userId to associate entries with users
  favorite?: boolean; // Optional Favorite flag
}
