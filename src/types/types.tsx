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
  validation?: {
    required?: string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
  };
  placeholder?: string;
};

export type ButtonProps = {
  type?: "submit" | "button" | "reset";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export interface User {
  id?: number;
  email: string;
  name: string;
  foodEntries?: FoodEntry[];
  glucoseEntries?: GlucoseEntry[];
  moodEntries?: MoodEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUserData: (updatedUser: User) => void;
  setUser: (user: User) => void;
  getUserData: (email: string) => User | null;
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
}

export interface GlucoseEntry {
  id?: number;
  glucose: number;
  userId: number | string;
  timestamp: string;
}

export interface FoodEntry {
  id?: number;
  food: string;
  carb: string;
  userId: number | string;
  favorite?: boolean;
  category?: string;
  weight?: string;
  weightUnit?: string;
  timestamp: string;
}

export interface MoodEntry {
  id?: number;
  mood: string;
  hoursWorkedOut: number;
  notes?: string;
  userId: number | string;
  timestamp: string;
}

export interface CategorySelectionBoxProps {
  onSelectCategory: (category: string) => void;
  onClose: () => void;
}
