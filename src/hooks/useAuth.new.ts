import { useContext } from "react";
import { AuthContextType } from "../types/types";
import { AuthContext } from "../contexts/AuthContext";

/**
 * useAuth Hook - Enterprise pattern with proper error handling
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider. " +
        "Wrap your app with <AuthProvider> to use authentication features."
    );
  }

  return context;
};
