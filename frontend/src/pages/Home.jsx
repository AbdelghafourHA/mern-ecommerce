import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ShoppingCart,
  Shield,
  Truck,
  Clock,
  Pause,
  Play,
} from "lucide-react";
import Footer from "../components/Footer";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";

import { Perfum, Cosmetic, Gift } from "../utils/utils";
import HeroSection from "../components/HeroSection";

const Home = () => {
  const categories = [
    {
      name: "Parfums",
      link: "perfumes",
      image: Perfum,
      subcategories: ["Pour Hommes", "Pour Femmes"],
      description: "Fragrances de luxe qui définissent votre personnalité",
    },
    {
      name: "Cosmétiques",
      link: "cosmetics",
      image: Cosmetic,
      subcategories: ["Pour Hommes", "Pour Femmes"],
      description: "Produits de beauté premium pour des looks radieux",
    },
    {
      name: "Cadeaux",
      link: "gifts",
      image: Gift,
      subcategories: ["Pour Hommes", "Pour Femmes"],
      description: "Cadeaux attentionnés pour vos proches",
    },
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6 md:w-8 md:h-8" />,
      title: "Qualité Premium",
      description: "Produits 100% authentiques avec qualité garantie",
    },
    {
      icon: <Truck className="w-6 h-6 md:w-8 md:h-8" />,
      title: "Livraison Rapide",
      description: "Livraison rapide à votre porte",
    },
    {
      icon: <Clock className="w-6 h-6 md:w-8 md:h-8" />,
      title: "Paiement à la Livraison",
      description: "Paiement à la livraison pour votre commodité",
    },
  ];

  const formatPrice = (price) => {
    return `${price.toLocaleString("fr-FR")} DA`;
  };

  // دالة لحساب السعر النهائي
  const calculateFinalPrice = (product) => {
    return product.discount > 0
      ? product.newPrice > 0
        ? product.newPrice
        : Math.round(product.price * (1 - product.discount / 100))
      : product.price;
  };

  const { products, getFeaturedProducts } = useProductStore();

  useEffect(() => {
    getFeaturedProducts();
  }, [getFeaturedProducts]);

  const { addToCart } = useCartStore();

  return (
    <div
      className="min-h-screen bg-background overflow-x-hidden"
      style={{ fontFamily: "var(--font-p01, sans-serif)" }}
    >
      {/* Hero Section */}
      <HeroSection />

      {/* Shop by Category Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="costum-section">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
              Nos Catégories
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-primary/80 max-w-2xl mx-auto">
              Explorez nos collections organisées pour tous les goûts et
              occasions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <Link to={`/category/${category.link}`} key={category.name}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="relative overflow-hidden h-64 md:h-80">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-4 md:p-6">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-background mb-2">
                        {category.name}
                      </h3>
                      <p className="text-background/80 text-xs sm:text-sm mb-2 md:mb-3">
                        {category.description}
                      </p>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {category.subcategories.map((subcat) => (
                          <span
                            key={subcat}
                            className="bg-secondary text-primary px-2 py-1 rounded-full text-xs font-semibold"
                          >
                            {subcat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-primary text-background">
        <div className="costum-section">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Pourquoi Nous Choisir
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-background/80 max-w-2xl mx-auto">
              Découvrez la différence avec nos produits premium et service
              exceptionnel
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-background/10 backdrop-blur-lg p-6 md:p-8 rounded-2xl text-center hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-secondary mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 md:mb-4">
                  {feature.title}
                </h3>
                <p className="text-background/80 text-sm md:text-base">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-20 bg-background">
        <div className="costum-section">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
              Produits Populaires
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-primary/80 max-w-2xl mx-auto">
              Découvrez nos produits les plus appréciés
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => {
              // حساب السعر النهائي
              const finalPrice = calculateFinalPrice(product);
              const hasDiscount = product.discount > 0;

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Link to={`/products/${product._id}`}>
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Top Badges - Category and Gender always on top */}
                      <div className="absolute top-3 right-3 bg-secondary text-primary px-2 py-1 rounded-full text-xs font-semibold">
                        {product.category}
                      </div>
                      <div className="absolute top-3 left-3 bg-accent text-primary px-2 py-1 rounded-full text-xs font-semibold capitalize">
                        {product.gender}
                      </div>

                      {/* Discount Badge below gender badge */}
                      {hasDiscount && (
                        <div className="absolute top-12 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          -{product.discount}%
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <h3 className="text-sm sm:text-base font-semibold text-primary mb-3 line-clamp-2">
                      {product.title}
                    </h3>

                    {/* Price Display - Clean and Professional */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-lg font-bold ${
                            hasDiscount ? "text-red-600" : "text-secondary"
                          }`}
                        >
                          {formatPrice(finalPrice)}
                        </span>

                        {hasDiscount && (
                          <span className="text-sm text-primary/60 line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                      onClick={() => addToCart(product)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-primary text-background py-2 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Ajouter au panier</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-background mb-4 md:mb-6">
              Prêt à Vivre le Luxe ?
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-background/80 mb-6 md:mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de clients satisfaits
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link to="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer bg-secondary text-primary px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:shadow-xl transition-all duration-300"
                >
                  Voir la Collection
                </motion.button>
              </Link>
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer border-2 border-background text-background px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-background hover:text-primary transition-all duration-300"
              >
                Nous Contacter
              </motion.button> */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <Footer colorBg={"background"} colorText={"primary"} />
    </div>
  );
};

export default Home;
