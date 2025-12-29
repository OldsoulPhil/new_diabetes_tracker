import React from "react";
import { ButtonProps } from "../../types/types";

/**
 * Reusable Button component with consistent styling and disabled state
 * Memoized to prevent unnecessary re-renders when parent re-renders
 */
export const Button = React.memo<ButtonProps>(
  ({
    type = "button",
    children,
    className = "",
    onClick,
    disabled = false,
  }) => (
    <button
      type={type}
      className={`bg-orange-600 text-white rounded-lg p-2 w-full hover:bg-black transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  )
);

Button.displayName = "Button";
