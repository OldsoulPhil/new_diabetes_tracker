import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Registration } from "./pages/auth/RegistrationForm";
import { Login } from "./pages/auth/Login";
import { Home } from "./pages/Home";
import { FavoriteFood } from "./pages/FavoriteFoods";
import { AuthProvider } from "./components/auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favoritefoods"
            element={
              <ProtectedRoute>
                <FavoriteFood />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
