import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // prevents duplicate users
      trim: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
