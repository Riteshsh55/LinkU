import { useEffect, useState } from "react";
import api from "./api";

function Analytics({ slug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/hub/${slug}/analytics`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [slug]);

  if (loading) return <div>Loading analytics...</div>;
  if (!data) return null;

  // ============================
  // 🔥 BUSINESS LOGIC (CORRECT)
  // ============================

  const links = data.links || [];

  const TOP_THRESHOLD = 10;

  // Top Performing = clicks >= 10
  const topLinks = links
    .filter(link => (link.clicks || 0) >= TOP_THRESHOLD)
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

  // Low Performing = clicks < 10
  const leastLinks = links
    .filter(link => (link.clicks || 0) < TOP_THRESHOLD)
    .sort((a, b) => (a.clicks || 0) - (b.clicks || 0));

  return (
    <div style={{ marginTop: "40px", borderTop: "1px solid #0f0", paddingTop: "20px" }}>
      <h2>Analytics Dashboard</h2>

      <p>
        <strong>Total Visits:</strong> {data.visits}
      </p>

      <h4>Top Performing Links (10+ clicks)</h4>
      {topLinks.length === 0 && <div>No top performing links yet</div>}
      {topLinks.map(link => (
        <div key={link._id}>
          {link.title} — {link.clicks} clicks
        </div>
      ))}

      <h4 style={{ marginTop: "20px" }}>
        Low Performing Links (&lt; 10 clicks)
      </h4>
      {leastLinks.length === 0 && <div>No low performing links</div>}
      {leastLinks.map(link => (
        <div key={link._id}>
          {link.title} — {link.clicks} clicks
        </div>
      ))}
    </div>
  );
}

export default Analytics;

