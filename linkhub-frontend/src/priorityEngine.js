export function computePriorityScore(link, index, context) {
  let score = 0;

  // 1️⃣ Manual order (earlier = higher)
  const manualWeight = (100 - index) * 2;
  score += manualWeight;

  // 2️⃣ Click performance
  const clicks = link.clicks || 0;
  const clickWeight = clicks * 5;
  score += clickWeight;

  // 3️⃣ Time-based window boost (NEW)
  if (link.priorityStart && link.priorityEnd) {
    const nowMinutes = context.nowMinutes;
    const start = parseTimeToMinutes(link.priorityStart);
    const end = parseTimeToMinutes(link.priorityEnd);

    if (start !== null && end !== null) {
      const inWindow =
        start <= end
          ? nowMinutes >= start && nowMinutes <= end
          : nowMinutes >= start || nowMinutes <= end; // handles overnight

     if (inWindow) {
  // FORCE this link to top during window
  score += 10000;
}

    }
  }

  // 4️⃣ Device-based boost
  if (context.device === "mobile" && link.tags?.includes("mobile")) {
    score += 40;
  }

  if (context.device === "desktop" && link.tags?.includes("desktop")) {
    score += 20;
  }

  // 5️⃣ LIVE boost (manual override)
 if (link.isLive) {
  score += 20000; // ALWAYS TOP
}


  return score;
}

// Helper
function parseTimeToMinutes(hhmm) {
  if (!hhmm || !hhmm.includes(":")) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

