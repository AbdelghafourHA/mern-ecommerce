import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByCategory,
  toggleFeatured,
  updateProduct,
  updateProductPricing,
  updateProductDiscount,
  applyDiscountToAll,
  removeDiscountFromAll,
} from "../controllers/products.controller.js";
import { verifyAdmin, adminRoute } from "../middleweres/auth.middleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:productId", getProductById);
router.post("/", verifyAdmin, adminRoute, createProduct);
router.delete("/:id", verifyAdmin, adminRoute, deleteProduct);
router.patch("/:id", verifyAdmin, adminRoute, toggleFeatured);
router.put("/:id", verifyAdmin, adminRoute, updateProduct);
router.put(
  "/:productId/discount",
  verifyAdmin,
  adminRoute,
  updateProductDiscount
);
router.put(
  "/:productId/pricing",
  verifyAdmin,
  adminRoute,
  updateProductPricing
);

router.put("/discount/all", verifyAdmin, adminRoute, applyDiscountToAll);
router.delete("/discount/all", verifyAdmin, adminRoute, removeDiscountFromAll);

export default router;
