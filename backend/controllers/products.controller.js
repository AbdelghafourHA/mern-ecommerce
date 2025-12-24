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
    const {
      title,
      description,
      price,
      image,
      category,
      gender,
      volumePricing,
      availableSizes,
      defaultVolume,
    } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    // For decants, ensure base price is 10ml price
    let basePrice = price;
    let processedVolumePricing = {};

    if (category === "Decants" && volumePricing) {
      // Use 10ml price as base price
      basePrice = volumePricing["10ml"] || price;

      // Store volume pricing
      processedVolumePricing = volumePricing;
    }

    const product = await Product.create({
      title,
      description,
      price: basePrice,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
      gender,
      volumePricing: processedVolumePricing,
      availableSizes:
        category === "Decants"
          ? availableSizes || ["10ml", "20ml", "30ml"]
          : [],
      defaultVolume: category === "Decants" ? defaultVolume || "10ml" : null,
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
    const {
      category,
      volumePricing = {},
      availableSizes = [],
      defaultVolume = null,
      ...otherFields
    } = req.body;

    // For decants, ensure base price is 10ml price
    let basePrice = otherFields.price;
    if (category === "Decants" && volumePricing["10ml"]) {
      basePrice = volumePricing["10ml"];
    }

    // Prepare update data
    const updateData = {
      ...otherFields,
      price: basePrice,
      category,
      volumePricing: category === "Decants" ? volumePricing : {},
      availableSizes: category === "Decants" ? availableSizes : [],
      defaultVolume: category === "Decants" ? defaultVolume : null,
    };

    // Perform update
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

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

export const updateProductDiscount = async (req, res) => {
  try {
    const { productId } = req.params;
    const { discount } = req.body;

    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        message: "Le discount doit être entre 0 et 100",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    let updateData = {
      discount,
    };

    // For decants, apply discount to all volume prices
    if (product.category === "Decants") {
      // Calculate discounted base price (10ml)
      const discountedBasePrice =
        discount > 0
          ? Math.round(product.price * (1 - discount / 100))
          : product.price;

      updateData.newPrice = discountedBasePrice;

      // Calculate discounted prices for all volumes
      if (product.volumePricing && product.volumePricing.size > 0) {
        const discountedVolumePricing = new Map();

        for (const [volume, price] of product.volumePricing.entries()) {
          const discountedPrice =
            discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
          discountedVolumePricing.set(volume, discountedPrice);
        }

        updateData.discountedVolumePricing = discountedVolumePricing;
      }
    } else {
      // For regular products
      const newPrice =
        discount > 0
          ? Math.round(product.price * (1 - discount / 100))
          : product.price;
      updateData.newPrice = newPrice;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product discount:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

export const updateProductPricing = async (req, res) => {
  try {
    const { productId } = req.params;
    const { price, discount, volumePricing } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    let updateData = {};

    if (price !== undefined) {
      updateData.price = price;
    }

    if (discount !== undefined) {
      if (discount < 0 || discount > 100) {
        return res.status(400).json({
          message: "Le discount doit être entre 0 et 100",
        });
      }
      updateData.discount = discount;

      // For decants, apply discount to all volumes
      if (product.category === "Decants") {
        const basePrice = price !== undefined ? price : product.price;
        updateData.newPrice =
          discount > 0
            ? Math.round(basePrice * (1 - discount / 100))
            : basePrice;

        // Calculate discounted prices for all volumes
        if (product.volumePricing && product.volumePricing.size > 0) {
          const discountedVolumePricing = new Map();

          for (const [
            volume,
            originalPrice,
          ] of product.volumePricing.entries()) {
            const discountedPrice =
              discount > 0
                ? Math.round(originalPrice * (1 - discount / 100))
                : originalPrice;
            discountedVolumePricing.set(volume, discountedPrice);
          }

          updateData.discountedVolumePricing = discountedVolumePricing;
        }
      } else {
        // Regular products
        const basePrice = price !== undefined ? price : product.price;
        updateData.newPrice =
          discount > 0
            ? Math.round(basePrice * (1 - discount / 100))
            : basePrice;
      }
    }

    // Update volume pricing for decants
    if (product.category === "Decants" && volumePricing) {
      updateData.volumePricing = volumePricing;

      // Update discounted prices if discount exists
      if (product.discount > 0) {
        const discountedVolumePricing = new Map();

        for (const [volume, price] of Object.entries(volumePricing)) {
          const discountedPrice = Math.round(
            price * (1 - product.discount / 100)
          );
          discountedVolumePricing.set(volume, discountedPrice);
        }

        updateData.discountedVolumePricing = discountedVolumePricing;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product pricing:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

export const applyDiscountToAll = async (req, res) => {
  try {
    const { discount, categories } = req.body;

    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        message: "Le discount doit être entre 0 et 100",
      });
    }

    let query = {};
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    const products = await Product.find(query);

    if (products.length === 0) {
      return res.status(404).json({ message: "Aucun produit trouvé" });
    }

    const updateOperations = products.map((product) => {
      const updateData = {
        discount,
      };

      if (product.category === "Decants") {
        // Apply discount to base price
        updateData.newPrice =
          discount > 0
            ? Math.round(product.price * (1 - discount / 100))
            : product.price;

        // Apply discount to all volume prices
        if (product.volumePricing && product.volumePricing.size > 0) {
          const discountedVolumePricing = new Map();

          for (const [volume, price] of product.volumePricing.entries()) {
            const discountedPrice =
              discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
            discountedVolumePricing.set(volume, discountedPrice);
          }

          updateData.discountedVolumePricing = discountedVolumePricing;
        }
      } else {
        // Regular products
        updateData.newPrice =
          discount > 0
            ? Math.round(product.price * (1 - discount / 100))
            : product.price;
      }

      return {
        updateOne: {
          filter: { _id: product._id },
          update: { $set: updateData },
        },
      };
    });

    await Product.bulkWrite(updateOperations);

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

export const removeDiscountFromAll = async (req, res) => {
  try {
    const { categories } = req.body;

    let query = { discount: { $gt: 0 } };
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    const products = await Product.find(query);

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun produit avec discount trouvé" });
    }

    const updateOperations = products.map((product) => {
      const updateData = {
        discount: 0,
        newPrice: product.price,
      };

      // For decants, reset discounted volume pricing
      if (product.category === "Decants") {
        updateData.discountedVolumePricing = new Map();
      }

      return {
        updateOne: {
          filter: { _id: product._id },
          update: { $set: updateData },
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

// Get price for specific volume
export const getVolumePrice = async (req, res) => {
  try {
    const { productId, volume } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    if (product.category !== "Decants") {
      return res.status(400).json({
        message: "Volume pricing only available for decants",
      });
    }

    // Get price for specific volume
    const volumePrice = product.volumePricing?.get(volume);

    if (!volumePrice) {
      return res
        .status(404)
        .json({ message: `Prix pour ${volume} non trouvé` });
    }

    // Check if we have discounted price
    let finalPrice = volumePrice;
    let hasDiscount = false;

    if (product.discount > 0) {
      // Use discounted volume price if available
      const discountedPrice = product.discountedVolumePricing?.get(volume);
      if (discountedPrice) {
        finalPrice = discountedPrice;
        hasDiscount = true;
      } else {
        // Fallback: calculate discount manually
        finalPrice = Math.round(volumePrice * (1 - product.discount / 100));
        hasDiscount = true;
      }
    }

    res.json({
      volume,
      originalPrice: volumePrice,
      finalPrice,
      discount: product.discount,
      hasDiscount,
    });
  } catch (error) {
    console.error("Error getting volume price:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};
