import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FormData } from "../../types/types";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";

const VALIDATION_MESSAGES = {
  NAME_REQUIRED: "Name is required",
  NAME_MIN_LENGTH: "Name must be at least 2 characters",
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Please enter a valid email address",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_MIN_LENGTH: "Password must be at least 8 characters long",
  PASSWORD_PATTERN:
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
};

export const Registration = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register: registerField,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Register user with secure API
      await registerUser(data.email, data.password, data.name);
      reset();
      setIsRegistered(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrorMessage(
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  const handleGoToHome = () => {
    navigate("/home");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <div className="bg-gray-700 p-6 md:p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl md:text-2xl font-bold text-white text-center mb-6">
          Registration Form
        </h1>

        {errorMessage && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        {!isRegistered ? (
          <>
            <div className="bg-blue-900 text-white p-3 rounded mb-4 text-sm">
              <h3 className="font-semibold mb-1">Password Requirements:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>At least 8 characters long</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <FormField
                label="Full Name"
                id="name"
                type="text"
                register={registerField}
                error={errors.name}
                validation={{
                  required: VALIDATION_MESSAGES.NAME_REQUIRED,
                  minLength: {
                    value: 2,
                    message: VALIDATION_MESSAGES.NAME_MIN_LENGTH,
                  },
                }}
              />
              <FormField
                label="Email Address"
                id="email"
                type="email"
                register={registerField}
                error={errors.email}
                validation={{
                  required: VALIDATION_MESSAGES.EMAIL_REQUIRED,
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: VALIDATION_MESSAGES.EMAIL_INVALID,
                  },
                }}
              />
              <FormField
                label="Password"
                id="password"
                type="password"
                register={registerField}
                error={errors.password}
                validation={{
                  required: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
                  minLength: {
                    value: 8,
                    message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: VALIDATION_MESSAGES.PASSWORD_PATTERN,
                  },
                }}
              />
              <Button type="submit" className="mb-4" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
              <Button
                type="button"
                onClick={handleNavigateToLogin}
                disabled={isLoading}
              >
                Go to Login
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-green-500 text-white p-4 rounded mb-4">
              <p className="font-semibold">Registration successful!</p>
              <p className="text-sm">Your account has been created securely.</p>
            </div>
            <Button type="button" onClick={handleGoToHome} className="mb-2">
              Go to Home
            </Button>
            <Button type="button" onClick={handleNavigateToLogin}>
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
