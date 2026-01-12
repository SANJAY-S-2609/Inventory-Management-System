import mongoose from "mongoose";

const ItemsSchema  = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
      unique: true, // NO DUPLICATES HERE
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Plumbing items",
        "Electrical items",
        "Painting items",
        "Carpentry items",
        "Sanitation items"
        ],
    },

    unit: {
      type: String,
      required: true,
      enum: [
        "pcs","kg","g","liter","ml",
        "m","cm","mm","box","packet","dozen"
      ],
    },

    hsnSac: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Items || mongoose.model("Items", ItemsSchema);
