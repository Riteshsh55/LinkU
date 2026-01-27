import express from "express";
import cors from "cors";
import linkHubRoutes from "./routes/linkHubRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 MOUNT ROUTES UNDER /api
app.use("/api", linkHubRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API running");
});

export default app;

