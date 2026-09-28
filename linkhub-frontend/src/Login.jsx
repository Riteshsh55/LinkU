import { useState } from "react";
import api from "./api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");     // ✅ email not username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const login = async () => {
  try {
    setLoading(true);
    const res = await api.post("/auth/login", { email, password });

    console.log("LOGIN RESPONSE:", res.data);

    localStorage.setItem("adminToken", res.data.token);
    console.log("SAVED TOKEN:", localStorage.getItem("adminToken"));

    window.location.href = "/dashboard";
  } catch (err) {
    console.error("Login error FULL:", err);
    console.error("Response:", err.response?.data);
    alert("Login failed: " + (err.response?.data?.message || "Unknown"));
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ marginTop: "40px" }}>
      <h2>Admin Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={login} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p>
        Don&apos;t have an account?{" "}
        <a href="/signup" style={{ color: "#0a7a3d" }}>
          Sign up here
        </a>
      </p>
    </div>
  );
}

export default Login;

