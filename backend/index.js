import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import productsRoutes from "./routes/products.route.js";
import checkoutRoutes from "./routes/checkout.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import shippingRoutes from "./routes/shipping.route.js";
import { verifyAdmin } from "./middleweres/auth.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ===============================
   Trust Proxy (IMPORTANT on Render)
================================ */
app.set("trust proxy", 1);

/* ===============================
   CORS (iOS SAFE)
================================ */
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // مثال: https://myapp.vercel.app
    credentials: true,
  })
);

/* ===============================
   Core Middlewares
================================ */
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

/* ===============================
   Rate Limiters
================================ */

// Auth (login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Checkout
const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
});

// Products read
const productsReadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
});

// Analytics
const analyticsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
});

/* ===============================
   Routes
================================ */

// Auth
app.use("/api/auth", authLimiter, authRoutes);

// Products (public)
app.use("/api/products", productsReadLimiter, productsRoutes);

// Checkout
app.use("/api/checkout", checkoutLimiter, checkoutRoutes);

// Shipping (admin)
app.use("/api/shipping", verifyAdmin, shippingRoutes);

// Analytics (admin)
app.use("/api/analytics", verifyAdmin, analyticsLimiter, analyticsRoutes);

/* ===============================
   Health Check
================================ */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* ===============================
   Global Error Handler
================================ */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

/* ===============================
   Start Server
================================ */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

startServer();
