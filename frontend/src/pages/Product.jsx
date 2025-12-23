import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "../components/Footer";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";

const Product = () => {
  const { productId } = useParams();
  const { getProductById, product, loading } = useProductStore();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(""); // حالة الحجم المختار

  useEffect(() => {
    if (productId) {
      getProductById(productId);
    }
  }, [productId, getProductById]);

  // Initialize selected size when product loads
  useEffect(() => {
    if (product && product.category === "Decants") {
      // Set default to product.defaultVolume or first available size
      const defaultSize =
        product.defaultVolume ||
        (product.availableSizes && product.availableSizes[0]) ||
        "10ml";
      setSelectedSize(defaultSize);
    }
  }, [product]);

  const formatPrice = (price) => {
    if (!price) return "0 DA";
    return `${price.toLocaleString("fr-FR")} DA`;
  };

  const { addToCartWithQuantity } = useCartStore();

  // Calculate unit price based on selected size and volume pricing
  const calculateUnitPrice = () => {
    if (!product || !product.price) return 0;

    let price = product.price;

    // For decants, use volume pricing if available
    if (
      product.category === "Decants" &&
      selectedSize &&
      product.volumePricing
    ) {
      // Convert Map to object if needed
      const volumePricing =
        product.volumePricing instanceof Map
          ? Object.fromEntries(product.volumePricing)
          : product.volumePricing;

      // Get price for selected volume
      const volumePrice = volumePricing?.[selectedSize];
      if (volumePrice) {
        price = volumePrice;
      }
    }

    // Apply discount if any
    if (product.discount > 0) {
      return product.newPrice > 0
        ? product.newPrice
        : Math.round(price * (1 - product.discount / 100));
    }

    return price;
  };

  // Direct checkout - only this product
  const handleBuyNow = () => {
    if (!product) return;

    // Calculate unit price with discount and size
    const unitPrice = calculateUnitPrice();

    // Create a temporary cart with ONLY this product and quantity
    const checkoutProduct = {
      ...product,
      quantity: quantity,
      unitPrice: unitPrice,
      selectedSize: product.category === "Decants" ? selectedSize : null,
      // ADD VOLUME TO THE PRODUCT DATA
      volume: product.category === "Decants" ? selectedSize : null,
      // Store the actual price used
      price: unitPrice,
    };

    // Calculate total
    const checkoutTotal = unitPrice * quantity;

    // Save to localStorage for checkout page
    const checkoutData = {
      directCheckout: true,
      product: checkoutProduct,
      total: checkoutTotal,
      count: quantity,
    };

    localStorage.setItem("directCheckout", JSON.stringify(checkoutData));

    // Navigate to checkout
    navigate("/checkout");
  };

  // Normal add to cart - adds to existing cart
  const handleAddToCart = () => {
    if (!product) return;

    // Calculate unit price with discount and size
    const unitPrice = calculateUnitPrice();

    // Prepare product data with size if it's a decant
    const productToAdd = {
      ...product,
      selectedSize: product.category === "Decants" ? selectedSize : null,
      // ADD VOLUME TO THE CART ITEM
      volume: product.category === "Decants" ? selectedSize : null,
      // ADD THE CALCULATED UNIT PRICE
      originalPrice: product.price, // Keep original price for reference
      price: unitPrice, // Use the calculated price based on size
    };

    addToCartWithQuantity(productToAdd, quantity);
  };

  // Calculate total price for display
  const calculateTotalPrice = () => {
    if (!product) return 0;
    return calculateUnitPrice() * quantity;
  };

  // Get available sizes from product data
  const getAvailableSizes = () => {
    if (product?.category === "Decants") {
      return product.availableSizes || ["10ml", "20ml", "30ml"];
    }
    return [];
  };

  // Get price for a specific volume (for display)
  const getVolumePrice = (size) => {
    if (!product || !product.volumePricing || product.category !== "Decants") {
      return calculateUnitPrice();
    }

    // Handle both Map and object formats
    let volumePricing;
    if (
      product.volumePricing instanceof Map ||
      product.volumePricing[Symbol.iterator]
    ) {
      try {
        volumePricing = Object.fromEntries(product.volumePricing);
      } catch {
        volumePricing = {};
      }
    } else {
      volumePricing = product.volumePricing || {};
    }

    const volumePrice = volumePricing[size];
    if (volumePrice) {
      // Apply discount if any
      if (product.discount > 0) {
        return product.newPrice > 0
          ? product.newPrice
          : Math.round(volumePrice * (1 - product.discount / 100));
      }
      return volumePrice;
    }

    return calculateUnitPrice();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  // Show error state if no product
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background text-background pt-16 sm:pt-20">
          <div className="costum-section">
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer flex items-center space-x-2 text-primary hover:text-secondary transition-colors text-sm sm:text-base"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="font-p01 font-bold">Retour</span>
            </button>
          </div>
        </header>

        <div className="costum-section py-12 text-center">
          <h1 className="text-2xl font-bold01 text-primary mb-4">
            Produit non trouvé
          </h1>
          <p className="text-primary/80 font-p01">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-primary text-background px-6 py-3 rounded-xl font-bold01 hover:bg-secondary transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>

        <Footer colorBg={"primary"} colorText={"background"} />
      </div>
    );
  }

  const unitPrice = calculateUnitPrice();
  const totalPrice = calculateTotalPrice();
  const hasDiscount = product.discount > 0;
  const isDecant = product.category === "Decants";
  const availableSizes = getAvailableSizes();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-background text-background pt-16 sm:pt-20"
      >
        <div className="costum-section">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer flex items-center space-x-2 text-primary hover:text-secondary transition-colors font-bold01 text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="font-p01 font-semibold">Retour</span>
          </button>
        </div>
      </motion.header>

      {/* Product Section */}
      <section className="costum-section py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16"
        >
          {/* Product Image */}
          <div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="aspect-square overflow-hidden rounded-2xl bg-white shadow-lg"
            >
              <img
                src={product.image || "/placeholder-image.jpg"}
                alt={product.title || "Product image"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
            </motion.div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 sm:space-y-6">
            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold01 text-primary leading-tight">
              {product.title || "Nom du produit non disponible"}
              {isDecant && selectedSize && (
                <span className="text-xl sm:text-2xl text-primary/70 ml-2">
                  ({selectedSize})
                </span>
              )}
            </h1>

            {/* Category & Gender Badges */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {product.category && (
                <span className="bg-secondary text-primary px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  {product.category}
                </span>
              )}
              {product.gender && (
                <span className="bg-accent text-primary px-3 py-1 rounded-full text-xs sm:text-sm font-semibold capitalize">
                  {product.gender}
                </span>
              )}
              {hasDiscount && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                  -{product.discount}%
                </span>
              )}
            </div>

            {/* Size Selector for Decants */}
            {isDecant && (
              <div className="space-y-3 sm:space-y-4 pt-2">
                <h3 className="text-lg sm:text-xl font-bold01 text-primary">
                  Sélectionner la taille:
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {availableSizes.map((size) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSize(size)}
                      className={`cursor-pointer px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 border text-sm sm:text-base ${
                        selectedSize === size
                          ? "bg-primary text-background border-primary"
                          : "bg-background text-primary border-primary/20 hover:border-primary"
                      }`}
                    >
                      {size}
                      {isDecant && product.volumePricing && (
                        <span className="block text-xs mt-1 opacity-75">
                          {formatPrice(getVolumePrice(size))}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Display */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Current Price */}
                <span className="text-xl sm:text-2xl lg:text-3xl font-p01 text-secondary font-bold">
                  {formatPrice(unitPrice)}
                  {isDecant && selectedSize && (
                    <span className="text-lg sm:text-xl text-primary/60 ml-2">
                      /{selectedSize}
                    </span>
                  )}
                </span>

                {/* Original Price if discounted */}
                {hasDiscount && (
                  <span className="text-lg sm:text-xl text-primary/60 line-through">
                    {formatPrice(
                      isDecant && selectedSize && product.volumePricing
                        ? (() => {
                            // Handle both Map and object formats
                            let volumePricing;
                            if (
                              product.volumePricing instanceof Map ||
                              product.volumePricing[Symbol.iterator]
                            ) {
                              try {
                                volumePricing = Object.fromEntries(
                                  product.volumePricing
                                );
                              } catch {
                                volumePricing = {};
                              }
                            } else {
                              volumePricing = product.volumePricing || {};
                            }
                            return volumePricing[selectedSize] || product.price;
                          })()
                        : product.price
                    )}
                    {isDecant && selectedSize && (
                      <span className="text-sm ml-1">/{selectedSize}</span>
                    )}
                  </span>
                )}
              </div>

              {/* Size-based pricing info for decants */}
              {isDecant && product.volumePricing && (
                <div className="bg-accent/10 p-3 sm:p-4 rounded-xl border border-accent/20">
                  <p className="text-sm sm:text-base text-primary/70">
                    <span className="font-semibold">Tarification:</span> Chaque
                    taille a son propre prix.
                    {selectedSize && (
                      <>
                        <br />
                        <span className="font-semibold">
                          Taille sélectionnée:
                        </span>{" "}
                        <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded text-xs font-semibold">
                          {selectedSize}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Total Price for Quantity */}
              {quantity > 1 && (
                <div className="bg-primary/5 p-3 sm:p-4 rounded-xl">
                  <div className="text-sm sm:text-base text-primary/70 mb-1">
                    <span className="font-semibold">
                      Total ({quantity} {quantity > 1 ? "articles" : "article"}
                      ):
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-secondary">
                    {formatPrice(totalPrice)}
                  </div>
                  <div className="text-xs sm:text-sm text-primary/60 mt-1">
                    {quantity} × {formatPrice(unitPrice)}
                    {isDecant && selectedSize && ` (${selectedSize} chacun)`}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="pt-2">
              <h3 className="text-lg sm:text-xl font-bold01 text-primary mb-2">
                Description
              </h3>
              <p className="text-base sm:text-lg text-primary/80 font-p01 leading-relaxed">
                {product.description || "Aucune description disponible."}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3 sm:space-y-4 pt-4">
              <h3 className="text-lg sm:text-xl font-bold01 text-primary">
                Quantité:
              </h3>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="cursor-pointer w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold01 text-base sm:text-lg hover:bg-primary/20 transition-colors border border-primary/20"
                  aria-label="Réduire la quantité"
                >
                  -
                </motion.button>
                <span className="text-primary font-bold01 text-xl sm:text-2xl w-10 sm:w-12 text-center bg-primary/5 py-2 rounded-lg">
                  {quantity}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="cursor-pointer w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold01 text-base sm:text-lg hover:bg-primary/20 transition-colors border border-primary/20"
                  aria-label="Augmenter la quantité"
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={isDecant && !selectedSize}
                className={`cursor-pointer flex-1 border-2 border-primary text-primary py-3 sm:py-4 rounded-xl font-bold01 text-sm sm:text-base hover:bg-primary hover:text-background transition-all duration-300 flex items-center justify-center gap-3 ${
                  isDecant && !selectedSize
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <span className="font-p01 font-semibold">
                  Ajouter au Panier
                </span>
                {isDecant && selectedSize && (
                  <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded text-xs font-semibold">
                    {selectedSize}
                  </span>
                )}
              </motion.button>

              <motion.button
                onClick={handleBuyNow}
                disabled={isDecant && !selectedSize}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer flex-1 bg-secondary text-primary py-3 sm:py-4 rounded-xl font-bold01 text-sm sm:text-base hover:shadow-lg hover:bg-secondary/90 transition-all duration-300 flex items-center justify-center gap-3 ${
                  isDecant && !selectedSize
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <span className="font-p01 font-semibold">
                  Acheter Maintenant
                </span>
                {isDecant && selectedSize && (
                  <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded text-xs font-semibold">
                    {selectedSize}
                  </span>
                )}
              </motion.button>
            </div>

            {/* Size Requirement Notice */}
            {isDecant && !selectedSize && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm sm:text-base">
                  ⚠️ Veuillez sélectionner une taille avant d'ajouter au panier.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer colorBg={"primary"} colorText={"background"} />
    </div>
  );
};

export default Product;
