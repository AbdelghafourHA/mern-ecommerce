import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    willaya: {
      type: String,
      required: true,
    },
    commune: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    deliveryType: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        // ADD VOLUME FIELD FOR DECANTS
        volume: {
          type: String,
          default: null,
        },
      },
    ],
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    subtotalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
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
