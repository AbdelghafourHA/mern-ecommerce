import express from "express";

import {
  createCheckout,
  deleteCheckout,
  getAllCheckouts,
  updateCheckoutStatus,
} from "../controllers/checkout.controller.js";
import { verifyAdmin, adminRoute } from "../middleweres/auth.middleware.js";

const router = express.Router();

router.get("/", verifyAdmin, adminRoute, getAllCheckouts);

router.post("/", createCheckout);

router.put("/:id", verifyAdmin, adminRoute, updateCheckoutStatus);

router.delete("/:id", verifyAdmin, adminRoute, deleteCheckout);

export default router;
