import express from "express";
import {
  getAdminProfile,
  loginAdmin,
  logoutAdmin,
  refreshToken,
  updateAdmin,
  createAdmin,
  deleteAdmin,
  getAllAdmins,
} from "../controllers/auth.controller.js";
import { verifyAdmin, adminRoute } from "../middleweres/auth.middleware.js";

const router = express.Router();

// Admin login route
router.post("/login", loginAdmin);

// Admin logout route
router.post("/logout", logoutAdmin);

// Refresh token route
router.post("/refresh-token", refreshToken);

// get profile route
router.get("/profile", verifyAdmin, getAdminProfile);

router.put("/update", verifyAdmin, adminRoute, updateAdmin);

router.post("/create", verifyAdmin, adminRoute, createAdmin);

router.delete("/delete/:id", verifyAdmin, adminRoute, deleteAdmin);

router.get("/admins", verifyAdmin, adminRoute, getAllAdmins);

export default router;
