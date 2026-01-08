import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../models/admin.model.js";
import { redis } from "../config/redis.js";

dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const admin = await Admin.findById(decoded.adminId).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Admin introuvable" });
    }

    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) return res.status(401).json({ message: "Unauthorized" });
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

export const adminRoute = (req, res, next) => {
  if (req.admin) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized - Admin not found" });
    console.log("error in adminRoute middleware");
  }
};
