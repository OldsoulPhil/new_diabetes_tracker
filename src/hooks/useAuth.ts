import { useContext } from "react";
import { AuthContextType } from "../types/types";
import { AuthContext } from "../components/auth/AuthProvider";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
