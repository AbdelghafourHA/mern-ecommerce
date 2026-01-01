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
      type: [String],
      enum: ["homme", "femme"],
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
    // Store discounted volume prices separately
    discountedVolumePricing: {
      type: Map,
      of: Number,
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

// Pre-save middleware to handle discount calculation
productSchema.pre("save", function (next) {
  // If discount is applied or removed, calculate new prices
  if (this.discount >= 0 && this.discount <= 100) {
    // For regular products
    if (this.category !== "Decants") {
      if (this.discount > 0) {
        this.newPrice = Math.round(this.price * (1 - this.discount / 100));
      } else {
        this.newPrice = this.price;
      }
    }
    // For decants
    else {
      if (this.discount > 0) {
        // Calculate discounted base price (10ml)
        this.newPrice = Math.round(this.price * (1 - this.discount / 100));

        // Calculate discounted prices for all volumes
        if (this.volumePricing && this.volumePricing.size > 0) {
          const discountedVolumePricing = new Map();

          for (const [volume, price] of this.volumePricing.entries()) {
            const discountedPrice = Math.round(
              price * (1 - this.discount / 100)
            );
            discountedVolumePricing.set(volume, discountedPrice);
          }

          this.discountedVolumePricing = discountedVolumePricing;
        }
      } else {
        // No discount - reset prices
        this.newPrice = this.price;
        this.discountedVolumePricing = new Map();
      }
    }
  }

  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
