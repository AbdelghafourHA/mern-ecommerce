import express from "express";
const router = express.Router();
import {
  getProductsAnalytics,
  getCheckoutAnalytics,
  getAllAnalytics,
} from "../controllers/analytics.controller.js";

router.get("/products", getProductsAnalytics);
router.get("/checkouts", getCheckoutAnalytics);
router.get("/all", getAllAnalytics);

export default router;
