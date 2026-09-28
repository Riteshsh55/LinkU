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
        {/* Public single link page */}
        <Route path="/u/:slug" element={<PublicHub />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

      <Route
  path="/dashboard"
  element={
    localStorage.getItem("adminToken") ? (
      <Dashboard />
    ) : (
      <Navigate to="/login" />
    )
  }
/>

        />

        {/* Default */}
        <Route
          path="*"
          element={<Navigate to={isAdmin ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

