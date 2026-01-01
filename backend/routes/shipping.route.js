import express from "express";
import {
  getAllShipping,
  createShipping,
  updateShipping,
  toggleShipping,
} from "../controllers/shipping.controller.js";
import { verifyAdmin } from "../middleweres/auth.middleware.js";

const router = express.Router();

/* ---------- Public (for checkout) ---------- */
router.get("/", getAllShipping);

/* ---------- Admin ---------- */
router.post("/", verifyAdmin, createShipping);
router.put("/:id", verifyAdmin, updateShipping);
router.patch("/:id/toggle", verifyAdmin, toggleShipping);

export default router;
