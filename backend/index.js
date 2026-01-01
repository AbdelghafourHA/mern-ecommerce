import express from "express";
import dotenv from "dotenv";
// import path from "path";
import cookieParser from "cookie-parser";
// import helmet from "helmet";
// import cors from "cors";
// import rateLimit from "express-rate-limit";

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
const __dirname = process.cwd();

/* ===============================
   Trust Proxy (IMPORTANT for Render / Vercel / Nginx)
================================ */
// app.set("trust proxy", 1);

/* ===============================
   Security Middlewares
================================ */
// app.use(helmet());
// app.disable("x-powered-by");

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   })
// );

/* ===============================
   Core Middlewares
================================ */
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// /* ===============================
//    Rate Limiters (SMART)
// ================================ */

// // Auth (login / admin)
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 20,
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Checkout (prevent spam orders)
// const checkoutLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 30,
// });

// // Products READ (browsing safe)
// const productsReadLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 300,
// });

// // ✏️ Products WRITE (admin only)
// const productsWriteLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 50,
// });

// // Analytics (HEAVY QUERIES)
// const analyticsLimiter = rateLimit({
//   windowMs: 5 * 60 * 1000,
//   max: 20,
// });

/* ===============================
   Routes
================================ */

// Auth
app.use("/api/auth", authRoutes);

// Products
app.use("/api/products", productsRoutes);

// Admin write protection (inside routes use verifyAdmin + productsWriteLimiter)

// Checkout
app.use("/api/checkout", checkoutRoutes);

// Shipping (admin controlled – light)
app.use("/api/shipping", verifyAdmin, shippingRoutes);

// 📊 Analytics (ADMIN + LIMITED)
app.use("/api/analytics", verifyAdmin, analyticsRoutes);

/* ===============================
   Health Check
================================ */
// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "ok" });
// });

// /* ===============================
//    Production Frontend
// ================================ */
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "frontend-dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "frontend-dist", "index.html"));
//   });
// }

/* ===============================
   Global Error Handler
================================ */
// app.use((err, req, res, next) => {
//   console.error("❌ Error:", err);

//   const statusCode = err.statusCode || 500;
//   res.status(statusCode).json({
//     success: false,
//     message:
//       process.env.NODE_ENV === "production"
//         ? "Something went wrong"
//         : err.message,
//   });
// });

/* ===============================
   Process-level Protection
================================ */
// process.on("unhandledRejection", (err) => {
//   console.error("❌ Unhandled Rejection:", err);
// });

// process.on("uncaughtException", (err) => {
//   console.error("❌ Uncaught Exception:", err);
// });

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
