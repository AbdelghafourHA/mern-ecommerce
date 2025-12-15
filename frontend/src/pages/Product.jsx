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

  useEffect(() => {
    if (productId) {
      getProductById(productId);
    }
  }, [productId, getProductById]);

  const formatPrice = (price) => {
    if (!price) return "0 DA";
    return `${price.toLocaleString("fr-FR")} DA`;
  };

  const { addToCartWithQuantity } = useCartStore();

  // Fixed handleBuyNow - Add to cart AND navigate to checkout
  const handleBuyNow = () => {
    if (!product) return;

    // Add the product with quantity to cart
    addToCartWithQuantity(product, quantity);

    // Navigate to checkout
    navigate("/checkout");
  };

  // Handle adding to cart only
  const handleAddToCart = () => {
    if (!product) return;
    addToCartWithQuantity(product, quantity);
  };

  // Calculate total price for display
  const calculateTotalPrice = () => {
    if (!product || !product.price) return 0;
    // Use discounted price if available
    const unitPrice =
      product.discount > 0
        ? product.newPrice > 0
          ? product.newPrice
          : Math.round(product.price * (1 - product.discount / 100))
        : product.price;

    return unitPrice * quantity;
  };

  // Calculate unit price
  const calculateUnitPrice = () => {
    if (!product || !product.price) return 0;

    return product.discount > 0
      ? product.newPrice > 0
        ? product.newPrice
        : Math.round(product.price * (1 - product.discount / 100))
      : product.price;
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
              className="cursor-pointer flex items-center space-x-2 text-primary hover:text-secondary transition-colors font-bold01 text-sm sm:text-base"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span>Retour</span>
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
            <span>Retour</span>
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

            {/* Price Display */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Current Price */}
                <span className="text-xl sm:text-2xl lg:text-3xl font-p01 text-secondary font-bold">
                  {formatPrice(unitPrice)}
                </span>

                {/* Original Price if discounted */}
                {hasDiscount && (
                  <span className="text-lg sm:text-xl text-primary/60 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Total Price for Quantity */}
              {quantity > 1 && (
                <div className="bg-primary/5 p-3 sm:p-4 rounded-xl">
                  <div className="text-sm sm:text-base text-primary/70 mb-1">
                    <span className="font-semibold">
                      Total ({quantity} articles):
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-secondary">
                    {formatPrice(totalPrice)}
                  </div>
                  <div className="text-xs sm:text-sm text-primary/60 mt-1">
                    {quantity} × {formatPrice(unitPrice)}
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
                className="cursor-pointer flex-1 border-2 border-primary text-primary py-3 sm:py-4 rounded-xl font-bold01 text-sm sm:text-base hover:bg-primary hover:text-background transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span>Ajouter au Panier</span>
                {quantity > 1 && (
                  <span className="bg-primary text-background px-2 py-1 rounded-full text-xs font-bold">
                    {quantity}
                  </span>
                )}
              </motion.button>

              <motion.button
                onClick={handleBuyNow}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer flex-1 bg-secondary text-primary py-3 sm:py-4 rounded-xl font-bold01 text-sm sm:text-base hover:shadow-lg hover:bg-secondary/90 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span>Acheter Maintenant</span>
                {quantity > 1 && (
                  <span className="bg-primary text-background px-2 py-1 rounded-full text-xs font-bold">
                    {quantity}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer colorBg={"primary"} colorText={"background"} />
    </div>
  );
};

export default Product;
