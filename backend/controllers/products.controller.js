import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products) {
      return res.status(404).json({ message: "No products found" });
    }
    res.json(products);
  } catch (error) {
    console.log("error in getAllProducts controller", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true });
    if (!products) {
      return res.status(404).json({ message: "No featured products found" });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category: category });
    if (!products) {
      return res.status(404).json({ message: "No products found" });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, image, category, gender } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      title,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
      gender,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeatured = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.isFeatured = !product.isFeatured;
    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Error toggling featured status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    }); // { new: true } returns the updated document
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // await product.save();
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error getting product by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// في controllers/productController.js
export const updateProductDiscount = async (req, res) => {
  try {
    const { productId } = req.params;
    const { discount } = req.body;

    // التحقق من أن التخفيض بين 0 و 100
    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        message: "Le discount doit être entre 0 et 100",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // حساب السعر الجديد
    const newPrice =
      discount > 0 ? product.price * (1 - discount / 100) : product.price;

    // تحديث المنتج
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        discount,
        newPrice: Math.round(newPrice), // تقريب السعر
      },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product discount:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

// دالة إضافية لتحديث التخفيض والسعر معاً
export const updateProductPricing = async (req, res) => {
  try {
    const { productId } = req.params;
    const { price, discount } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    let newPrice = price;

    // إذا كان هناك تخفيض، احسب السعر الجديد
    if (discount > 0) {
      newPrice = price * (1 - discount / 100);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        price,
        discount: discount || 0,
        newPrice: Math.round(newPrice),
      },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product pricing:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

// في controllers/productController.js
export const applyDiscountToAll = async (req, res) => {
  try {
    const { discount, categories } = req.body;

    // التحقق من أن التخفيض بين 0 و 100
    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        message: "Le discount doit être entre 0 et 100",
      });
    }

    // بناء query بناءً على الفئات المحددة
    let query = {};
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    // جلب المنتجات بناءً على الاستعلام
    const products = await Product.find(query);

    if (products.length === 0) {
      return res.status(404).json({ message: "Aucun produit trouvé" });
    }

    // تحديث كل المنتجات
    const updateOperations = products.map((product) => {
      const newPrice =
        discount > 0
          ? Math.round(product.price * (1 - discount / 100))
          : product.price;

      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            discount,
            newPrice,
          },
        },
      };
    });

    // تنفيذ جميع عمليات التحديث في قاعدة البيانات
    await Product.bulkWrite(updateOperations);

    // جلب المنتجات المحدثة
    const updatedProducts = await Product.find(query);

    res.json({
      message: `Discount of ${discount}% applied to ${updatedProducts.length} products`,
      products: updatedProducts,
    });
  } catch (error) {
    console.error("Error applying discount to all products:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

// دالة لإزالة التخفيض من جميع المنتجات
export const removeDiscountFromAll = async (req, res) => {
  try {
    const { categories } = req.body;

    // بناء query بناءً على الفئات المحددة
    let query = { discount: { $gt: 0 } }; // فقط المنتجات التي لديها تخفيض
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    const products = await Product.find(query);

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun produit avec discount trouvé" });
    }

    // إزالة التخفيض من جميع المنتجات
    const updateOperations = products.map((product) => {
      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $unset: { discount: "", newPrice: "" },
          },
        },
      };
    });

    await Product.bulkWrite(updateOperations);

    const updatedProducts = await Product.find({
      _id: { $in: products.map((p) => p._id) },
    });

    res.json({
      message: `Discount removed from ${updatedProducts.length} products`,
      products: updatedProducts,
    });
  } catch (error) {
    console.error("Error removing discount from all products:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};
