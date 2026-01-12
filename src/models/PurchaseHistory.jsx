import mongoose from "mongoose";

const PurchaseHistorySchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    supplierId: {
      type: String,
      required: true,
    },

    // List of purchased items (store ItemDetails itemId)
    
    itemIds: [
      {
        type: String,
        required: true,
      },
    ],

    gstPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },


    totalAmountBeforeTax: {
      type: Number,
      required: true,
      min: 0,
    },

    totalTaxAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmountAfterTax: {
      type: Number,
      required: true,
      min: 0,
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PurchaseHistory ||
  mongoose.model("PurchaseHistory", PurchaseHistorySchema);
