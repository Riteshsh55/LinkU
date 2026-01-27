import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./src/app.js";

// ✅ FIXED PATHS
import authRoutes from "./src/routes/authRoutes.js";
import linkHubRoutes from "./src/routes/linkHubRoutes.js";

dotenv.config();

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api", linkHubRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

  })
  .catch(err => console.error(err));

