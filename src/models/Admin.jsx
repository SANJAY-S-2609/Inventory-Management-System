import mongoose from "mongoose";

const Admin = new mongoose.Schema({
  adminPassword: { type: String, default: "admin123" },
});

export default mongoose.models.Admin || mongoose.model("Admin", Admin);