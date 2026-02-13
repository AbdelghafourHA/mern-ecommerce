import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { category, gender, maxPrice, sort } = req.query;

    /* -------------------------
    1️⃣ BUILD GLOBAL QUERY
    --------------------------*/
    const query = {};
    const countQuery = {};

    const { search } = req.query;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      query.category = category;
    }
    // تصحيح فلترة الجندر للمصفوفة
    if (gender && gender !== "all") {
      query.gender = { $in: [gender] }; // استخدام $in للبحث في المصفوفة
    }

    // Price filter (price OR newPrice)
    if (maxPrice) {
      query.$or = [
        { newPrice: { $lte: Number(maxPrice) } },
        { price: { $lte: Number(maxPrice) } },
      ];
    }

    /* -------------------------
       2️⃣ SORTING
    --------------------------*/
    let sortQuery = { createdAt: -1 }; // newest default

    if (sort === "price_asc") {
      sortQuery = { newPrice: 1, price: 1 };
    } else if (sort === "price_desc") {
      sortQuery = { newPrice: -1, price: -1 };
    }

    /* -------------------------
       3️⃣ TOTAL PRODUCTS (GLOBAL)
    --------------------------*/
    const globalTotalProducts = await Product.countDocuments({});

    const totalProducts = await Product.countDocuments(query);

    /* -------------------------
       4️⃣ PAGINATED PRODUCTS
    --------------------------*/
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    /* -------------------------
       5️⃣ GLOBAL COUNTS (NOT PAGE)
    --------------------------*/

    const categoryCounts = await Product.aggregate([
      { $match: countQuery },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // تصحيح حساب الـ genderCounts للمصفوفة
    const genderCounts = await Product.aggregate([
      { $match: countQuery },
      { $unwind: "$gender" }, // تفكيك المصفوفة أولاً
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
    ]);

    /* -------------------------
       6️⃣ RESPONSE
    --------------------------*/
    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        globalTotalProducts,
        limit,
      },
      counts: {
        categories: categoryCounts,
        genders: genderCounts,
      },
    });
  } catch (error) {
    console.error("error in getAllProducts controller", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { gender, maxPrice, sort } = req.query;

    /* -------------------------
       1️⃣ BASE QUERY (CATEGORY FIXED)
    --------------------------*/
    const query = { category };
    const countQuery = { category };

    // تصحيح فلترة الجندر للمصفوفة
    if (gender && gender !== "all") {
      query.gender = { $in: [gender] }; // استخدام $in للبحث في المصفوفة
    }

    if (maxPrice) {
      query.$or = [
        { newPrice: { $lte: Number(maxPrice) } },
        { price: { $lte: Number(maxPrice) } },
      ];
      countQuery.$or = query.$or;
    }

    /* -------------------------
       2️⃣ SORT
    --------------------------*/
    let sortQuery = { createdAt: -1 };
    if (sort === "price_asc") sortQuery = { newPrice: 1, price: 1 };
    if (sort === "price_desc") sortQuery = { newPrice: -1, price: -1 };

    /* -------------------------
       3️⃣ COUNTS
    --------------------------*/
    const totalProducts = await Product.countDocuments(query);
    const globalTotalProducts = await Product.countDocuments(countQuery);

    // تصحيح حساب الـ genderCounts للمصفوفة
    const genderCounts = await Product.aggregate([
      { $match: { category } },
      { $unwind: "$gender" }, // تفكيك المصفوفة أولاً
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
    ]);

    /* -------------------------
       4️⃣ PAGINATED DATA
    --------------------------*/
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    /* -------------------------
       5️⃣ RESPONSE
    --------------------------*/
    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        globalTotalProducts,
        limit,
      },
      counts: {
        genders: genderCounts,
      },
    });
  } catch (error) {
    console.error("getProductsByCategory error", error);
    res.status(500).json({ message: "Server error" });
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

export const toggleInStock = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.inStock = !product.inStock;
    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Error toggling inStock status:", error);
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
    const { fixedDiscount } = req.body;

    if (fixedDiscount < 0) {
      return res.status(400).json({ message: "Invalid discount" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Not found" });

    const newPrice = Math.max(product.price - fixedDiscount, 0);

    let updateData = {
      fixedDiscount,
      newPrice,
      discount: 0,
    };

    // Decants
    if (product.category === "Decants" && product.volumePricing) {
      const discountedVolumePricing = new Map();

      for (const [vol, price] of product.volumePricing.entries()) {
        discountedVolumePricing.set(vol, Math.max(price - fixedDiscount, 0));
      }

      updateData.discountedVolumePricing = discountedVolumePricing;
    }

    const updated = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
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

    let query = {};
    if (categories?.length) query.category = { $in: categories };

    const products = await Product.find(query);

    const ops = products.map((p) => {
      const newPrice = Math.round(p.price * (1 - discount / 100));

      let update = {
        discount,
        fixedDiscount: 0,
        newPrice,
      };

      if (p.category === "Decants" && p.volumePricing) {
        const map = new Map();
        for (const [v, price] of p.volumePricing.entries()) {
          map.set(v, Math.round(price * (1 - discount / 100)));
        }
        update.discountedVolumePricing = map;
      }

      return {
        updateOne: {
          filter: { _id: p._id },
          update: { $set: update },
        },
      };
    });

    await Product.bulkWrite(ops);
    const updated = await Product.find(query);
    res.json({ products: updated });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

export const removeDiscountFromAll = async (req, res) => {
  try {
    const { categories } = req.body;
    let query = {};
    if (categories?.length) query.category = { $in: categories };

    const products = await Product.find(query);

    const ops = products.map((p) => ({
      updateOne: {
        filter: { _id: p._id },
        update: {
          $set: {
            discount: 0,
            fixedDiscount: 0,
            newPrice: p.price,
            discountedVolumePricing: new Map(),
          },
        },
      },
    }));

    await Product.bulkWrite(ops);
    const updated = await Product.find(query);
    res.json({ products: updated });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

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
