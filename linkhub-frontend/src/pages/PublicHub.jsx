import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { computePriorityScore } from "../priorityEngine";

function PublicHub() {
  const { slug } = useParams();
  const [hub, setHub] = useState(null);
  const [visitorCountry, setVisitorCountry] = useState("Unknown");

  // ============================
  // LOAD HUB
  // ============================
  useEffect(() => {
    const fetchHub = async () => {
      try {
        const res = await api.get(`/hub/${slug}`);
        setHub(res.data);
      } catch (err) {
        console.error("Failed to load hub:", err);
      }
    };
    fetchHub();
  }, [slug]);

  // ============================
  // IP LOCATION (MORE RELIABLE)
  // ============================
  useEffect(() => {
  const fetchLocation = async () => {
    try {
      const res = await api.get("/geo");
      setVisitorCountry(res.data.country || "Unknown");
    } catch (err) {
      console.error("Backend geo failed:", err);
      setVisitorCountry("Unknown");
    }
  };
  fetchLocation();
}, []);


  if (!hub) return <div>Loading...</div>;

  // ============================
  // CONTEXT + DEBUG
  // ============================
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  console.log("🕒 LOCAL TIME:", now.toString());
  console.log("🧮 NOW MINUTES:", nowMinutes);

  const context = {
    isBusinessHours: (() => {
      const hour = now.getHours();
      return hour >= 9 && hour <= 18;
    })(),
    device: /Mobi|Android/i.test(navigator.userAgent)
      ? "mobile"
      : "desktop",
    nowMinutes,
    country: visitorCountry
  };

  // ============================
  // SMART PRIORITY SORT (HARD RULES)
  // ============================
  const sortedPublicLinks = [...hub.links]
    .map((link, index) => {
      let inTimeWindow = false;

      if (link.priorityStart && link.priorityEnd) {
        const [sh, sm] = link.priorityStart
          .split(":")
          .map(v => parseInt(v, 10));

        const [eh, em] = link.priorityEnd
          .split(":")
          .map(v => parseInt(v, 10));

        if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
          const startMinutes = sh * 60 + sm;
          const endMinutes = eh * 60 + em;

          if (startMinutes <= endMinutes) {
            inTimeWindow =
              nowMinutes >= startMinutes &&
              nowMinutes <= endMinutes;
          } else {
            // Overnight window (e.g. 22:00–02:00)
            inTimeWindow =
              nowMinutes >= startMinutes ||
              nowMinutes <= endMinutes;
          }
        }
      }

      // 🧮 Base score (keeps admin order + clicks)
      let score = computePriorityScore(link, index, context);

      // ============================
      // 🔴 HARD BUSINESS RULES
      // ============================

      // 1. LIVE = absolute top
      if (link.isLive) {
        score = 10000000;
      }

      // 2. TIME WINDOW = second absolute
      if (inTimeWindow && !link.isLive) {
        score = 9999999;
      }

      // 🔍 DEBUG PER LINK
      console.log("LINK DEBUG:", {
        title: link.title,
        priorityStart: link.priorityStart,
        priorityEnd: link.priorityEnd,
        nowMinutes,
        inTimeWindow,
        isLive: link.isLive,
        finalScore: score
      });

      return {
        ...link,
        _priorityScore: score,
        _inTimeWindow: inTimeWindow
      };
    })
    .sort((a, b) => b._priorityScore - a._priorityScore);

  return (
    <div className="App">
      <h1>{hub.title}</h1>
      <p>{hub.description}</p>

      <div style={{ fontSize: "12px", opacity: 0.6 }}>
        Visitor Country: {visitorCountry}
      </div>

      <h3>Smart Links (Context-Aware)</h3>

      {sortedPublicLinks.map(link => (
        <div key={link._id} style={{ marginBottom: "12px" }}>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              api.post(`/hub/click/${hub._id}/${link._id}`);
            }}
            style={{ color: "#00ff88", fontWeight: "bold" }}
          >
            {link.title}

            {link.isLive && (
              <span style={{ marginLeft: "8px", color: "red" }}>
                🔴 LIVE
              </span>
            )}

            {link._inTimeWindow && !link.isLive && (
              <span style={{ marginLeft: "8px", color: "#ffaa00" }}>
                ⏰ TIME PRIORITY
              </span>
            )}
          </a>

          <div style={{ fontSize: "12px", opacity: 0.6 }}>
            Clicks: {link.clicks || 0}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PublicHub;

