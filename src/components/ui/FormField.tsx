import React from "react";
import { FormFieldProps } from "../../types/types";

/**
 * Reusable FormField component with label, input, and error display
 * Integrates with react-hook-form for validation
 * Memoized to prevent unnecessary re-renders
 */
export const FormField = React.memo<FormFieldProps>(
  ({ label, id, type = "text", register, error, validation, placeholder }) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm text-white font-medium mb-2">
        {label}
        {validation?.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        className={`border rounded p-2 w-full transition-colors duration-200 ${
          error
            ? "border-red-500 focus:border-red-600 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        } focus:outline-none focus:ring-2`}
        type={type}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        {...register(id, validation)}
      />
      {error && (
        <span
          id={`${id}-error`}
          className="text-red-700 font-bold text-sm mt-1 block"
          role="alert"
        >
          *{error.message}*
        </span>
      )}
    </div>
  )
);

FormField.displayName = "FormField";
