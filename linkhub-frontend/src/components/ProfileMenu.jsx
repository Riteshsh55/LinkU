import { useState } from "react";
import api from "../api";

function ProfileMenu() {
  const [show, setShow] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const updateProfile = async () => {
    try {
      await api.put("/auth/profile", { name, email });
      alert("Profile updated");
      window.location.reload();
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Profile update failed");
    }
  };

  const changePassword = async () => {
    try {
      await api.post("/auth/change-password", {
        oldPassword,
        newPassword
      });
      alert("Password updated");
      setOldPassword("");
      setNewPassword("");
      setShow(false);
    } catch (err) {
      console.error("Password change failed:", err);
      alert("Password change failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    window.location.href = "/login";
  };

  return (
    <div style={{ position: "absolute", top: 10, right: 10 }}>
      <button onClick={() => setShow(!show)}>👤 Profile</button>

      {show && (
        <div
          style={{
            background: "#111",
            border: "1px solid #00ff88",
            padding: "12px",
            marginTop: "6px",
            color: "#fff"
          }}
        >
          <h4 style={{ color: "#00ff88" }}>Edit Profile</h4>

          <input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <button onClick={updateProfile}>Save Profile</button>

          <hr />

          <input
            placeholder="Old password"
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
          />

          <input
            placeholder="New password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />

          <div>
            <button onClick={changePassword}>Update Password</button>
            <button onClick={logout} style={{ marginLeft: "6px" }}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;

