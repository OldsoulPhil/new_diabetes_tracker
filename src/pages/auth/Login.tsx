import React from "react";
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

  const onSubmit = (data: FormData) => {
    login(data.email, data.password, data.name);
    navigate("/home");
  };

  const handleNavigateToRegister = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-gray-700 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Login Form
        </h1>
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
          <Button type="submit" className="w-full mb-4">
            Login
          </Button>
          <Button
            type="button"
            onClick={handleNavigateToRegister}
            className="w-full"
          >
            Return to Register Page
          </Button>
        </form>
      </div>
    </div>
  );
};
