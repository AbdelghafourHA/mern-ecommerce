import Checkout from "../models/checkout.model.js";
import Product from "../models/product.model.js";

/* ===============================
   Create Checkout (COD)
================================ */
export const createCheckout = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      willaya,
      commune,
      country,
      deliveryType,
      paymentMethod,
      orderItems,
      shippingPrice = 0,
    } = req.body;

    // Basic validation
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !address ||
      !willaya ||
      !commune ||
      !deliveryType ||
      !paymentMethod ||
      !Array.isArray(orderItems) ||
      orderItems.length === 0
    ) {
      return res.status(400).json({
        message: "Missing or invalid checkout data",
      });
    }

    let subtotalPrice = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (
        typeof item.price !== "number" ||
        item.price <= 0 ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid item price or quantity",
        });
      }

      const itemTotal = item.price * item.quantity;
      subtotalPrice += itemTotal;

      validatedItems.push({
        name: item.name || product.title,
        quantity: item.quantity,
        image: item.image || product.image,
        price: item.price, // ← السعر من frontend
        product: product._id,
        volume: item.volume || null,
      });
    }

    const totalPrice = subtotalPrice + shippingPrice;

    const checkout = await Checkout.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      willaya,
      commune,
      country,
      deliveryType,
      paymentMethod,
      orderItems: validatedItems,
      shippingPrice,
      subtotalPrice,
      totalPrice,
    });

    res.status(201).json(checkout);
  } catch (error) {
    console.error("error in createCheckout controller", error);
    res.status(500).json({
      message: "Failed to create checkout",
    });
  }
};

/* ===============================
   Get All Checkouts (Admin) - PAGINATED
================================ */
export const getAllCheckouts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10; // admin-friendly
    const skip = (page - 1) * limit;

    // 1️⃣ Total count (GLOBAL)
    const totalCheckouts = await Checkout.countDocuments({});

    // 2️⃣ Paginated data
    const checkouts = await Checkout.find({})
      .populate({
        path: "orderItems.product",
        select: "title category volumePricing availableSizes",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 3️⃣ Response
    res.json({
      checkouts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCheckouts / limit),
        totalCheckouts,
        limit,
      },
    });
  } catch (error) {
    console.error("error in getAllCheckouts controller", error);
    res.status(500).json({
      message: "Failed to fetch checkouts",
    });
  }
};

/* ===============================
   Update Checkout Status
================================ */
export const updateCheckoutStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const checkout = await Checkout.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!checkout) {
      return res.status(404).json({
        message: "Checkout not found",
      });
    }

    res.json(checkout);
  } catch (error) {
    console.error("error in updateCheckoutStatus controller", error);
    res.status(500).json({
      message: "Failed to update checkout",
    });
  }
};

/* ===============================
   Delete Checkout
================================ */
export const deleteCheckout = async (req, res) => {
  try {
    const { id } = req.params;

    const checkout = await Checkout.findByIdAndDelete(id);

    if (!checkout) {
      return res.status(404).json({
        message: "Checkout not found",
      });
    }

    res.json({ message: "Checkout deleted successfully" });
  } catch (error) {
    console.error("error in deleteCheckout controller", error);
    res.status(500).json({
      message: "Failed to delete checkout",
    });
  }
};
