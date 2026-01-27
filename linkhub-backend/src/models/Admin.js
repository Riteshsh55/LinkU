import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: String
});

export default mongoose.model("Admin", adminSchema);

