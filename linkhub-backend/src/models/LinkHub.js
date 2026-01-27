import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
  title: String,
  url: String,
  clicks: { type: Number, default: 0 },

  priorityStart: String,
  priorityEnd: String,
  isLive: { type: Boolean, default: false }
});

const linkHubSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  title: String,
  description: String,
  theme: String,
  slug: { type: String, unique: true },

  links: [linkSchema],
  visits: { type: Number, default: 0 }
});

export default mongoose.model("LinkHub", linkHubSchema);

