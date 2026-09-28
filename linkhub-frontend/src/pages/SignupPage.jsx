import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signup = async () => {
    try {
      setLoading(true);
      await api.post("/auth/signup", { name, email, password });
      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Signup failed (unknown error)"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">

      <h2>Sign Up</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <br />
      <br />

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <br />
      <br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />
      <br />

      <button onClick={signup} disabled={loading}>
        {loading ? "Creating..." : "Create Account"}
      </button>

      <p style={{ marginTop: "20px" }}>
        Already have an account?{" "}
        <a href="/login" style={{ color: "#0a7a3d" }}>
          Login here
        </a>
      </p>
    </div>
  );
}

export default SignupPage;

