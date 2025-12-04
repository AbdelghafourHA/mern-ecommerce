import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../models/admin.model.js";
import { redis } from "../config/redis.js";

dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: "No access token" });

    // check blacklist
    const blacklisted = await redis.get(`blk:access:${token}`);
    if (blacklisted) {
      return res.status(401).json({ message: "Access token revoked" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, ACCESS_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired" });
      }
      return res.status(401).json({ message: "Invalid access token" });
    }

    const admin = await Admin.findById(decoded.adminId).select("-password");
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    // check lock
    if (admin.isLocked) {
      return res.status(423).json({ message: "Account temporarily locked" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("verifyAdmin error:", error);
    res.status(500).json({ message: "Server error" });
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
