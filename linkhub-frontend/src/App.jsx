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

        {/* Public Hub */}
        <Route path="/u/:slug" element={<PublicHub />} />

        {/* Authentication */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard */}
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

        {/* First page / default */}
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

        {/* Unknown URL */}
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
