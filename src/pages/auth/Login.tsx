import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FormData } from "../../types/types";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";

const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "Email is required",
  PASSWORD_REQUIRED: "Password is required",
};

export const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      await login(data.email, data.password);
      navigate("/home");
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <div className="bg-gray-700 p-6 md:p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl md:text-2xl font-bold text-white text-center mb-6">
          Login Form
        </h1>

        {errorMessage && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField
            label="Email Address"
            id="email"
            type="email"
            register={register}
            error={errors.email}
            validation={{ required: VALIDATION_MESSAGES.EMAIL_REQUIRED }}
          />
          <FormField
            label="Password"
            id="password"
            type="password"
            register={register}
            error={errors.password}
            validation={{ required: VALIDATION_MESSAGES.PASSWORD_REQUIRED }}
          />
          <Button type="submit" className="w-full mb-4" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <Button
            type="button"
            onClick={handleNavigateToRegister}
            className="w-full"
            disabled={isLoading}
          >
            Return to Register Page
          </Button>
        </form>
      </div>
    </div>
  );
};
