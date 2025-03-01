import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FormData } from "../../types/types";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";

const VALIDATION_MESSAGES = {
  NAME_REQUIRED: "Name is required",
  EMAIL_REQUIRED: "Email is required",
  PASSWORD_REQUIRED: "Password is required",
};

export const Registration = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  const navigate = useNavigate();

  const onSubmit = (data: FormData) => {
    try {
      localStorage.setItem(
        data.email,
        JSON.stringify({
          name: data.name,
          password: data.password,
          foodEntries: [],
        })
      );
      reset();
      setIsRegistered(true);
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
    }
  };

  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-gray-700 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Registration Form
        </h1>
        {!isRegistered ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              label="Full Name"
              id="name"
              type="text"
              register={register}
              error={errors.name}
              validation={{ required: VALIDATION_MESSAGES.NAME_REQUIRED }}
            />
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
            <Button type="submit" className="mb-4">
              Register
            </Button>
            <Button type="button" onClick={handleNavigateToLogin}>
              Go to Login
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-white">Registration successful!</p>
            <Button type="button" onClick={handleNavigateToLogin}>
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
