import express from "express";
const router = express.Router();
import {
  getProductsAnalytics,
  getCheckoutAnalytics,
  getAllAnalytics,
} from "../controllers/analytics.controller.js";
import { verifyAdmin } from "../middleweres/auth.middleware.js";

router.get("/products", verifyAdmin, getProductsAnalytics);
router.get("/checkouts", verifyAdmin, getCheckoutAnalytics);
router.get("/all", verifyAdmin, getAllAnalytics);

export default router;
