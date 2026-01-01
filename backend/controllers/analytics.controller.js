import Checkout from "../models/checkout.model.js";
import Product from "../models/product.model.js";

const buildProductsAnalytics = async () => {
  const totalProducts = await Product.countDocuments({});
  const featuredProducts = await Product.countDocuments({ isFeatured: true });

  const categoryDistribution = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const completedCheckouts = await Checkout.find({
    status: "completed",
    createdAt: { $gte: sixMonthsAgo },
  }).populate({
    path: "orderItems.product",
    select: "title price image category",
  });

  const productSales = new Map();

  completedCheckouts.forEach((checkout) => {
    if (checkout.orderItems && checkout.orderItems.length > 0) {
      checkout.orderItems.forEach((item) => {
        if (item.product && item.product._id) {
          const productId = item.product._id.toString();
          const quantity = item.quantity || 1;

          if (productSales.has(productId)) {
            const existing = productSales.get(productId);
            existing.salesCount += quantity;
          } else {
            productSales.set(productId, {
              _id: item.product._id,
              title: item.product.title,
              price: item.product.price,
              image: item.product.image,
              category: item.product.category,
              salesCount: quantity,
            });
          }
        }
      });
    }
  });

  const topSellingProducts = Array.from(productSales.values())
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 10);

  return {
    totalProducts,
    featuredProducts,
    categoryDistribution,
    topSellingProducts,
  };
};

const buildCheckoutAnalytics = async () => {
  const totalCheckouts = await Checkout.countDocuments({});

  const recentCheckouts = await Checkout.find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const completedOrders = recentCheckouts.filter(
    (o) => o.status === "completed"
  );
  const processingOrders = recentCheckouts.filter(
    (o) => o.status === "processing"
  );
  const pendingOrders = recentCheckouts.filter(
    (o) => o.status === "pending" || !o.status
  );
  const cancelledOrders = recentCheckouts.filter(
    (o) => o.status === "cancelled"
  );

  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + (order.totalPrice || 0),
    0
  );

  const averageOrderValue =
    completedOrders.length > 0
      ? Math.round(totalRevenue / completedOrders.length)
      : 0;

  return {
    totalCheckouts,
    totalRevenue,
    completedOrders: completedOrders.length,
    processingOrders: processingOrders.length,
    pendingOrders: pendingOrders.length,
    cancelledOrders: cancelledOrders.length,
    averageOrderValue,
    recentCheckoutsCount: recentCheckouts.length,
  };
};

// Controllers - send responses only
export const getProductsAnalytics = async (req, res) => {
  try {
    const data = await buildProductsAnalytics();
    res.json({
      success: true,
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getProductsAnalytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product analytics",
      error: error.message,
    });
  }
};

export const getCheckoutAnalytics = async (req, res) => {
  try {
    const stats = await buildCheckoutAnalytics();
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getCheckoutAnalytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching checkout analytics",
      error: error.message,
    });
  }
};

export const getAllAnalytics = async (req, res) => {
  try {
    const [products, checkouts] = await Promise.all([
      buildProductsAnalytics(),
      buildCheckoutAnalytics(),
    ]);

    res.json({
      success: true,
      products,
      checkouts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getAllAnalytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message,
    });
  }
};
