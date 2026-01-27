import jwt from "jsonwebtoken";

// ===============================
// AUTH MIDDLEWARE (REQUIRE LOGIN)
// ===============================
export const requireAdmin = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ message: "No token" });
    }

    const token = auth.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user info to request
    req.userId = decoded.id;
    req.userType = decoded.type;

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

