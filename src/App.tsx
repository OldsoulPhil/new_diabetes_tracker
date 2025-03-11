import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Registration } from "./pages/auth/RegistrationForm";
import { Login } from "./pages/auth/Login";
import { Home } from "./pages/Home";
import { FavoriteFood } from "./pages/FavoriteFoods";
import { GlucoseEntries } from "./pages/GlucoseEntries"; // Import GlucoseEntries
import { Comparison } from "./pages/Comparison"; // Import Comparison
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
          <Route
            path="/glucoseentries"
            element={
              <ProtectedRoute>
                <GlucoseEntries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comparison"
            element={
              <ProtectedRoute>
                <Comparison />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
