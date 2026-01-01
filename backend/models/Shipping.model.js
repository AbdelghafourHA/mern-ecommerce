import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema(
  {
    wilayaCode: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    wilayaName: {
      type: String,
      required: true,
      trim: true,
    },

    officePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    homePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Shipping", shippingSchema);
