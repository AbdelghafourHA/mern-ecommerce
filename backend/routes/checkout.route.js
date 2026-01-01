import express from "express";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import {
  createCheckout,
  deleteCheckout,
  getAllCheckouts,
  updateCheckoutStatus,
} from "../controllers/checkout.controller.js";
import { verifyAdmin, adminRoute } from "../middleweres/auth.middleware.js";

const router = express.Router();

/* ===============================
   Helpers
================================ */
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  next();
};

/* ===============================
   Checkout Rate Limit (CRITICAL)
================================ */
const createCheckoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 orders per IP
  message: "Too many orders, please try later",
});

/* ===============================
   Routes
================================ */

// Admin
router.get("/", verifyAdmin, adminRoute, getAllCheckouts);

router.put(
  "/:id",
  validateObjectId,
  verifyAdmin,
  adminRoute,
  updateCheckoutStatus
);

router.delete(
  "/:id",
  validateObjectId,
  verifyAdmin,
  adminRoute,
  deleteCheckout
);

// Public (COD)
router.post("/", createCheckoutLimiter, createCheckout);

export default router;
