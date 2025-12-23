import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, X } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";

const Cart = () => {
  const { isCartOpen, setIsCartOpen } = useCart();
  const { cart, loadCart, increaseQuantity, decreaseQuantity, removeFromCart } =
    useCartStore();

  useEffect(() => {
    loadCart(); // تحميل الكارت من الـ LocalStorage عند البداية
  }, [loadCart]);

  const formatPrice = (price) => `${price.toLocaleString("fr-FR")} DA`;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-background z-50 overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="bg-primary text-background p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCartOpen(false)}
                    className="text-background hover:text-secondary transition-colors"
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </motion.button>
                  <h2 className="text-xl sm:text-2xl font-bold font-p01">
                    Mon Panier
                  </h2>
                </div>
                <div className="flex items-center space-x-2 bg-background/20 px-2 sm:px-3 py-1 rounded-full">
                  <ShoppingBag size={14} className="sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-bold01">
                    {cart.length}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between text-background/80 text-xs sm:text-sm font-bold01">
                <span>Total: {formatPrice(total)}</span>
                <span>
                  {cart.length} article{cart.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="p-4 sm:p-6">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 sm:py-12"
                >
                  <ShoppingBag className="mx-auto text-primary/40 mb-4 w-12 h-12 sm:w-16 sm:h-16" />
                  <h3 className="text-lg sm:text-xl font-bold text-primary font-p01 mb-2">
                    Votre panier est vide
                  </h3>
                  <p className="text-primary/60 font-bold01 mb-4 sm:mb-6 text-sm sm:text-base">
                    Découvrez nos produits et ajoutez-les à votre panier
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCartOpen(false)}
                    className="bg-secondary text-primary px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold01 hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                  >
                    Continuer mes achats
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <AnimatePresence>
                      {cart.map((item) => (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, x: 100 }}
                          className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-primary/10"
                        >
                          <div className="flex space-x-3 sm:space-x-4">
                            {/* Product Image */}
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                            />

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-primary font-bold01 text-xs sm:text-sm line-clamp-2 mb-1">
                                {item.title}
                              </h3>
                              <p className="text-primary/60 text-xs font-bold01 capitalize mb-2">
                                {item.gender} • {item.category}
                                {/* Display volume if it exists */}
                                {item.volume && (
                                  <span className="ml-2 bg-secondary/20 text-secondary px-2 py-0.5 rounded text-xs font-semibold">
                                    {item.volume}
                                  </span>
                                )}
                              </p>

                              {/* Price & Quantity */}
                              <div className="flex items-center justify-between">
                                <span className="text-base sm:text-lg font-bold text-secondary font-bold01">
                                  {formatPrice(item.price)}
                                </span>

                                <div className="flex items-center space-x-1 sm:space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => decreaseQuantity(item._id)}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                                  >
                                    <Minus
                                      size={12}
                                      className="sm:w-3 sm:h-3"
                                    />
                                  </motion.button>

                                  <span className="w-6 sm:w-8 text-center font-bold text-primary font-bold01 text-xs sm:text-sm">
                                    {item.quantity}
                                  </span>

                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => increaseQuantity(item._id)}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                                  >
                                    <Plus size={12} className="sm:w-3 sm:h-3" />
                                  </motion.button>
                                </div>
                              </div>

                              {/* Remove Item */}
                              <div className="flex items-center justify-end mt-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeFromCart(item._id)}
                                  className="text-secondary hover:text-primary transition-colors p-1"
                                >
                                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Total */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-primary/10 mb-4 sm:mb-6">
                    <div className="flex justify-between text-base sm:text-lg font-bold text-primary font-p01">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <Link to={`/checkout`}>
                      <motion.button
                        onClick={() => setIsCartOpen(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-secondary text-primary py-3 sm:py-4 rounded-xl font-bold01 text-sm sm:text-base hover:shadow-lg transition-all duration-300"
                      >
                        Passer la commande
                      </motion.button>
                    </Link>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsCartOpen(false)}
                      className="w-full border border-primary/20 text-primary py-2 sm:py-3 rounded-xl font-bold01 hover:border-secondary hover:text-secondary transition-all duration-300 text-sm sm:text-base"
                    >
                      Continuer mes achats
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
