import { useEffect, useState } from "react";
import api from "../api";
import ProfileMenu from "../components/ProfileMenu";

import Admin from "../Admin";
import Analytics from "../Analytics";

function Dashboard() {
  const [hub, setHub] = useState(null);

  // =========================
  // LOAD LOGGED-IN USER HUB
  // =========================
  const fetchHub = async () => {
    try {
      const res = await api.get("/hub/my-hub"); // 👈 PER-USER HUB
      setHub(res.data);
    } catch (err) {
      console.error("Failed to load user hub:", err);
    }
  };

  useEffect(() => {
    fetchHub();
  }, []);

  if (!hub) return <div>Loading dashboard...</div>;

  return (
    <div className="App">
      {/* 👤 PROFILE MENU (TOP RIGHT) */}
      <ProfileMenu />

      <h1>Dashboard</h1>

      <p>
        <strong>Your Public Link:</strong>{" "}
        <code>{window.location.origin}/u/{hub.slug}</code>
      </p>

      {/* ADMIN PANEL (MANAGE LINKS) */}
      <Admin hub={hub} refreshHub={fetchHub} />

      {/* ANALYTICS (PER USER) */}
      <Analytics slug={hub.slug} />
    </div>
  );
}

export default Dashboard;

