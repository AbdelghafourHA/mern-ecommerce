import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    newPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    category: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // ADD VOLUME PRICING FOR DECANTS
    volumePricing: {
      type: Map,
      of: Number, // e.g., { "10ml": 1500, "20ml": 2500, "30ml": 3500 }
      default: {},
    },
    availableSizes: {
      type: [String],
      default: ["10ml", "20ml", "30ml"], // Default sizes for decants
    },
    defaultVolume: {
      type: String,
      default: "10ml",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
