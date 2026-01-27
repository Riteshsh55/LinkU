import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./src/models/Admin.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const hash = await bcrypt.hash("admin123", 10);

await Admin.create({
  username: "admin",
  passwordHash: hash
});

console.log("Admin created: admin / admin123");
process.exit();

