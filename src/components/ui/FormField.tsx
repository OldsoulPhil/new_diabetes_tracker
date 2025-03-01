// Reusable FormField component
import React from "react";
import { FormFieldProps } from "../../types/types";

export const FormField = ({
  label,
  id,
  type,
  register,
  error,
  validation,
}: FormFieldProps) => (
  <div className="mb-4">
    <label className="block text-sm text-white font-medium mb-2">{label}</label>
    <input
      className="border border-gray-300 rounded p-2 w-full"
      type={type}
      {...register(id, { required: validation.required })}
    />
    {error && (
      <span className="text-red-700 font-bold text-sm">
        *{validation.required}*
      </span>
    )}
  </div>
);
