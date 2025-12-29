import { createContext } from "react";
import { AuthContextType } from "../types/types";

/**
 * Auth Context - Separated from provider for better modularity
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

AuthContext.displayName = "AuthContext";
