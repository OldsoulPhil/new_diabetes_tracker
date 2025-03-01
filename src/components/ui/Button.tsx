// Reusable Button component
import React from "react";
import { ButtonProps } from "../../types/types";

export const Button = ({
  type,
  children,
  className = "",
  onClick,
}: ButtonProps) => (
  <button
    type={type}
    className={`bg-orange-600 text-white rounded-lg p-2 w-full hover:bg-black transition duration-200 ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);
