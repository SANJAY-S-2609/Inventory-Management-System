import mongoose from "mongoose";

const ProductMasterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hsnSac: { type: String, required: true },
  },
  { timestamps: true }
);

ProductMasterSchema.index({ name: 1 }, { unique: true });

export default mongoose.models.ProductMaster ||
  mongoose.model("ProductMaster", ProductMasterSchema);