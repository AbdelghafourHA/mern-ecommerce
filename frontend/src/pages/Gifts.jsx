import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";

const Gifts = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [priceSort, setPriceSort] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const { products, getProductByCategory, loading } = useProductStore();

  useEffect(() => {
    getProductByCategory("Cadeaux");
  }, [getProductByCategory]);

  // دالة لحساب السعر النهائي
  const calculateFinalPrice = (product) => {
    return product.discount > 0
      ? product.newPrice > 0
        ? product.newPrice
        : Math.round(product.price * (1 - product.discount / 100))
      : product.price;
  };

  const genders = [
    {
      id: "all",
      name: "Tous les cadeaux",
      count: products.length,
    },
    {
      id: "femme",
      name: "Femme",
      count: products.filter((p) => p.gender === "femme").length,
    },
    {
      id: "homme",
      name: "Homme",
      count: products.filter((p) => p.gender === "homme").length,
    },
  ];

  useEffect(() => {
    if (products.length > 0 && selectedGenders.length === 0) {
      setSelectedGenders(["all"]);
    }
  }, [products, selectedGenders]);

  // Price formatting
  const formatPrice = (price) => {
    return `${price.toLocaleString("fr-FR")} DA`;
  };

  // Filtering gifts with gender filter and price sorting - UPDATED
  const filteredGifts = useMemo(() => {
    let filtered = products.filter((gift) => {
      const finalPrice = calculateFinalPrice(gift);

      const matchesGender =
        selectedGenders.length === 0 ||
        selectedGenders.includes("all") ||
        selectedGenders.includes(gift.gender);

      // استخدام السعر النهائي بدلاً من السعر الأصلي
      const matchesPrice = finalPrice <= priceRange[1];

      return matchesGender && matchesPrice;
    });

    // Apply price sorting based on final price
    if (priceSort === "asc") {
      filtered.sort((a, b) => calculateFinalPrice(a) - calculateFinalPrice(b));
    } else if (priceSort === "desc") {
      filtered.sort((a, b) => calculateFinalPrice(b) - calculateFinalPrice(a));
    } else {
      // Default sort by newest (ID)
      filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [products, selectedGenders, priceRange, priceSort]);

  // Pagination logic
  const totalPages = Math.ceil(filteredGifts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentGifts = filteredGifts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenders, priceRange, priceSort]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="costum-section">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-6"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <span className="text-primary">Nos</span>{" "}
            <span className="text-secondary">Cadeaux de Luxe</span>
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-primary/80 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Des coffrets cadeaux élégants pour toutes les occasions spéciales
          </motion.p>
        </motion.div>

        {/* Gender Buttons Row */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-8 px-4"
        >
          {genders.map((gender) => (
            <motion.button
              key={gender.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (gender.id === "all") {
                  setSelectedGenders(["all"]);
                } else {
                  setSelectedGenders([gender.id]);
                }
              }}
              className={`cursor-pointer px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 border flex items-center space-x-2 text-sm sm:text-base ${
                (gender.id === "all" && selectedGenders.includes("all")) ||
                (gender.id !== "all" && selectedGenders.includes(gender.id))
                  ? "bg-secondary text-background border-transparent shadow-lg"
                  : "bg-background text-primary border-primary/20 hover:border-secondary"
              }`}
            >
              <span>{gender.name}</span>
              <span className="text-xs sm:text-sm opacity-80">
                ({gender.count})
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Filter Button Row */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-background)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFilterOpen(true)}
            className="cursor-pointer flex items-center space-x-3 bg-primary text-background px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg font-semibold text-sm sm:text-base"
          >
            <Filter size={18} />
            <span>Filtres Avancés</span>
            {(priceRange[1] < 50000 || priceSort !== "none") && (
              <span className="bg-secondary text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                !
              </span>
            )}
          </motion.button>
        </motion.div>

        {/* Results Counter - Only show when not loading */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <p className="text-primary/60 text-sm sm:text-base md:text-lg">
              {filteredGifts.length} coffret
              {filteredGifts.length > 1 ? "s" : ""} cadeau
              {filteredGifts.length > 1 ? "x" : ""} trouvé
              {filteredGifts.length > 1 ? "s" : ""}
              {selectedGenders.length > 0 &&
                !selectedGenders.includes("all") &&
                ` • ${selectedGenders.join(", ")}`}
              {priceRange[1] < 50000 &&
                ` • Jusqu'à ${formatPrice(priceRange[1])}`}
              {priceSort !== "none" &&
                ` • Tri par prix ${
                  priceSort === "asc" ? "croissant" : "décroissant"
                }`}
            </p>
          </motion.div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary mx-auto mb-4"></div>
              <p className="text-primary text-lg">Chargement des cadeaux...</p>
            </div>
          </motion.div>
        )}

        {/* Gifts Grid - Only show when not loading */}
        {!loading && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={
                selectedGenders.join(",") +
                priceSort +
                priceRange[1] +
                currentPage
              }
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              <AnimatePresence mode="wait">
                {currentGifts.map((gift) => (
                  <GiftCard
                    key={gift._id}
                    gift={gift}
                    formatPrice={formatPrice}
                    calculateFinalPrice={calculateFinalPrice}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination - Only show if more than 10 gifts */}
            {filteredGifts.length > productsPerPage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center mt-12 space-x-4"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full ${
                    currentPage === 1
                      ? "text-primary/30 cursor-not-allowed"
                      : "text-primary hover:bg-primary/10 cursor-pointer"
                  }`}
                >
                  <ChevronLeft size={24} />
                </motion.button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return pageNumber <= totalPages ? (
                      <motion.button
                        key={pageNumber}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                          currentPage === pageNumber
                            ? "bg-secondary text-background"
                            : "text-primary hover:bg-primary/10"
                        }`}
                      >
                        {pageNumber}
                      </motion.button>
                    ) : null;
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full ${
                    currentPage === totalPages
                      ? "text-primary/30 cursor-not-allowed"
                      : "text-primary hover:bg-primary/10 cursor-pointer"
                  }`}
                >
                  <ChevronRight size={24} />
                </motion.button>

                <span className="text-primary/60 text-sm ml-4">
                  Page {currentPage} sur {totalPages}
                </span>
              </motion.div>
            )}
          </>
        )}

        {/* Empty State - Only show when not loading and no products */}
        {!loading && filteredGifts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">
              Aucun coffret cadeau trouvé
            </h3>
            <p className="text-primary/80 mb-6 text-sm sm:text-base">
              Essayez d'ajuster vos filtres
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedGenders(["all"]);
                setPriceRange([0, 50000]);
                setPriceSort("none");
              }}
              className="bg-accent text-primary px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
            >
              Réinitialiser les filtres
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Enhanced Filter Sidebar with Price filters only */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        priceSort={priceSort}
        setPriceSort={setPriceSort}
        formatPrice={formatPrice}
      />
      <Footer colorBg={"primary"} colorText={"background"} />
    </div>
  );
};

// Gift Card (updated with responsive design for 2 items per row)
const GiftCard = ({ gift, formatPrice, calculateFinalPrice }) => {
  const { addToCart } = useCartStore();

  const finalPrice = calculateFinalPrice(gift);
  const hasDiscount = gift.discount > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-background rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
    >
      <Link to={`/products/${gift._id}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={gift.image}
            alt={gift.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Badges - Responsive positioning */}
          <div className="absolute top-2 right-2 bg-secondary text-primary px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold">
            {gift.category}
          </div>
          <div className="absolute top-2 left-2 bg-accent text-primary px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold capitalize">
            {gift.gender}
          </div>

          {/* Discount Badge - Responsive size */}
          {hasDiscount && (
            <div className="absolute top-10 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold">
              -{gift.discount}%
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex flex-col grow">
        {/* Gift Title - Responsive text size and line clamp */}
        <h3 className="text-sm sm:text-base font-semibold text-primary mb-2 sm:mb-3 line-clamp-2 min-h-[2.5em]">
          {gift.title}
        </h3>

        {/* Price Display - Clean and Professional with responsive sizing */}
        <div className="mb-3 grow">
          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
            <span
              className={`text-sm sm:text-base lg:text-lg font-bold ${
                hasDiscount ? "text-red-600" : "text-secondary"
              }`}
            >
              {formatPrice(finalPrice)}
            </span>

            {hasDiscount && (
              <span className="text-xs sm:text-sm lg:text-base text-primary/60 line-through">
                {formatPrice(gift.price)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button - Responsive text and padding */}
        <motion.button
          onClick={() => addToCart(gift)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-primary text-background py-2 px-2 sm:px-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 mt-auto"
        >
          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="truncate text-sm md:text-base lg:text-lg">
            Ajouter
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// Enhanced Filter Sidebar with Price filters only
const FilterSidebar = ({
  isOpen,
  onClose,
  priceRange,
  setPriceRange,
  priceSort,
  setPriceSort,
  formatPrice,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 bg-background border-l border-primary/10 z-50 overflow-y-auto shadow-2xl"
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-primary">
                  Filtres Avancés
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-primary/60 hover:text-primary transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Price Sort Filter */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4">
                  Trier par prix
                </h3>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPriceSort("none")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 text-sm sm:text-base ${
                      priceSort === "none"
                        ? "bg-secondary text-background border-secondary shadow-lg"
                        : "bg-primary/5 border-primary/10 hover:border-secondary"
                    }`}
                  >
                    <span className="font-semibold">Aucun tri</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPriceSort("asc")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 text-sm sm:text-base ${
                      priceSort === "asc"
                        ? "bg-secondary text-background border-secondary shadow-lg"
                        : "bg-primary/5 border-primary/10 hover:border-secondary"
                    }`}
                  >
                    <span className="font-semibold">Prix croissant</span>
                    <ArrowUp size={16} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPriceSort("desc")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 text-sm sm:text-base ${
                      priceSort === "desc"
                        ? "bg-secondary text-background border-secondary shadow-lg"
                        : "bg-primary/5 border-primary/10 hover:border-secondary"
                    }`}
                  >
                    <span className="font-semibold">Prix décroissant</span>
                    <ArrowDown size={16} />
                  </motion.button>
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4">
                  Prix maximum: {formatPrice(priceRange[1])}
                </h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([0, parseInt(e.target.value)])
                    }
                    className="w-full accent-secondary"
                  />
                  <div className="flex justify-between text-primary/80 text-sm sm:text-base">
                    <span>{formatPrice(0)}</span>
                    <span>{formatPrice(50000)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "var(--color-secondary)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full bg-primary text-background py-3 sm:py-4 rounded-xl font-semibold hover:bg-secondary transition-all duration-300 shadow-lg text-sm sm:text-base"
                >
                  Appliquer les Filtres
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPriceRange([0, 50000]);
                    setPriceSort("none");
                  }}
                  className="w-full border border-primary/20 text-primary py-2 sm:py-3 rounded-xl font-semibold hover:border-secondary hover:text-secondary transition-all duration-300 text-sm sm:text-base"
                >
                  Réinitialiser les filtres
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Gifts;
