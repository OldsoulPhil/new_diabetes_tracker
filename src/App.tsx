import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Registration } from "./pages/auth/RegistrationForm";
import { Login } from "./pages/auth/Login";
import { Home } from "./pages/Home";
import { FavoriteFood } from "./pages/FavoriteFoods";
import { GlucoseEntries } from "./pages/GlucoseEntries";
import { MoodEntries } from "./pages/MoodEntries";
import { Comparison } from "./pages/Comparison";
import { InsulinCalculatorPage } from "./pages/InsulinCalculator";
import { AuthProvider } from "./components/auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

export const App = () => {
  return (
    <ErrorBoundary>
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
              path="/mood-tracker"
              element={
                <ProtectedRoute>
                  <MoodEntries />
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
            <Route
              path="/insulin-calculator"
              element={
                <ProtectedRoute>
                  <InsulinCalculatorPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};
