import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    willaya: {
      type: String,
      required: true,
      trim: true,
    },
    commune: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "Algeria",
    },
    deliveryType: {
      type: String,
      required: true,
      enum: ["home", "office"],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "COD"],
      default: "COD",
    },
    orderItems: [
      {
        name: { type: String, required: true, trim: true },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: { type: String, required: true },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        volume: {
          type: String,
          default: null,
        },
      },
    ],
    shippingPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    subtotalPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Checkout = mongoose.model("Checkout", checkoutSchema);
export default Checkout;
