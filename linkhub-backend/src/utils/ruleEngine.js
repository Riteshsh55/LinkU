export const applyRules = (links, context) => {
  let filtered = links.filter(link => {
    for (let rule of link.rules) {
      if (rule.type === "time") {
        if (context.hour < rule.value.start || context.hour > rule.value.end)
          return false;
      }

      if (rule.type === "device") {
        if (context.device !== rule.value)
          return false;
      }

      if (rule.type === "location") {
        if (context.country !== rule.value)
          return false;
      }
    }
    return true;
  });

  // Auto promote by clicks
  filtered.sort((a, b) => b.clicks - a.clicks);

  return filtered;
};

