import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import PublicHub from "./pages/PublicHub";
import Dashboard from "./pages/Dashboard";

function App() {
  const isAdmin = !!localStorage.getItem("adminToken");

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/u/:slug" element={<PublicHub />} />

        <Route path="/signup" element={<SignupPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            isAdmin ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/"
          element={
            isAdmin ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/signup" replace />
            )
          }
        />

        <Route
          path="*"
          element={
            isAdmin ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/signup" replace />
            )
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
