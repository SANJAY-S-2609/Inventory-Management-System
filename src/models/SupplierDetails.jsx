import mongoose from "mongoose";

const SupplierDetailsSchema = new mongoose.Schema(
  {
    supplierId: {
    type: String,
    unique: true,
    required: true,
    },

    supplierName: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    supplierMobileNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10,15}$/, "Invalid mobile number"],
    },

    companyNumber: {
      type: String,
      match: [/^[0-9]{10,15}$/, "Invalid company phone number"],
      unique : true,
    },

    godownNumber: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    Date: {
    type: Date,
    required: true,
    default: Date.now, // automatically stores the entry time
    }


  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SupplierDetails ||
  mongoose.model("SupplierDetails", SupplierDetailsSchema);
