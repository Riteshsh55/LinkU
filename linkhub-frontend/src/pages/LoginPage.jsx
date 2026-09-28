import { useState } from "react";
import api from "../api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password
      });

      console.log("LOGIN RESPONSE:", res.data);

      if (!res.data.token) {
        alert("Login failed: No token returned");
        return;
      }

      // ✅ Store token (matches rest of app)
      localStorage.setItem("adminToken", res.data.token);

      console.log("TOKEN SAVED:", localStorage.getItem("adminToken"));

      // ✅ Hard redirect (more reliable than navigate)
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("LOGIN ERROR FULL:", err);
      console.error("LOGIN ERROR DATA:", err.response?.data);

      alert(
        "Login failed: " +
          (err.response?.data?.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="App"
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "40px"
      }}
    >
      <h2 style={{ color: "#00ff88" }}>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ marginBottom: "10px" }}
      />
      <br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      <br />

      <button onClick={login} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
<p style={{ marginTop: "20px" }}>
  Don't have an account?{" "}
  <a href="/signup" style={{ color: "#00ff88" }}>
    Sign Up
  </a>
</p>
    </div>
  );
}

export default LoginPage;

