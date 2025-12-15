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

const Products = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [priceSort, setPriceSort] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const { products, getAllProducts, loading } = useProductStore();

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  // إضافة useEffect لتفعيل "all" تلقائياً عندما تُحمّل المنتجات
  useEffect(() => {
    if (products.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(["all"]);
    }
  }, [products, selectedCategories]);

  // دالة لحساب السعر النهائي
  const calculateFinalPrice = (product) => {
    return product.discount > 0
      ? product.newPrice > 0
        ? product.newPrice
        : Math.round(product.price * (1 - product.discount / 100))
      : product.price;
  };

  const categories = [
    {
      id: "all",
      name: "Tous les produits",
      count: products.length,
    },
    {
      id: "Parfums",
      name: "Parfums",
      count: products.filter((p) => p.category === "Parfums").length,
    },
    {
      id: "Cosmétiques",
      name: "Cosmétiques",
      count: products.filter((p) => p.category === "Cosmétiques").length,
    },
    {
      id: "Cadeaux",
      name: "Cadeaux",
      count: products.filter((p) => p.category === "Cadeaux").length,
    },
  ];

  const genders = [
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

  // Price formatting
  const formatPrice = (price) => {
    return `${price.toLocaleString("fr-FR")} DA`;
  };

  // Filtering products with gender filter and price sorting - UPDATED
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const finalPrice = calculateFinalPrice(product);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes("all") ||
        selectedCategories.includes(product.category);

      const matchesGender =
        selectedGenders.length === 0 ||
        selectedGenders.includes(product.gender);

      // استخدام السعر النهائي بدلاً من السعر الأصلي
      const matchesPrice = finalPrice <= priceRange[1];

      return matchesCategory && matchesGender && matchesPrice;
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
  }, [products, selectedCategories, selectedGenders, priceRange, priceSort]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedGenders, priceRange, priceSort]);

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
            <span className="text-primary">Notre</span>{" "}
            <span className="text-secondary">Collection Complète</span>
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-primary/80 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Découvrez tous nos produits de luxe soigneusement sélectionnés
          </motion.p>
        </motion.div>

        {/* Category Buttons Row */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-8 px-4"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (category.id === "all") {
                  setSelectedCategories(["all"]);
                } else {
                  setSelectedCategories([category.id]);
                }
              }}
              className={`cursor-pointer px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 border flex items-center space-x-2 text-sm sm:text-base ${
                (category.id === "all" && selectedCategories.includes("all")) ||
                (category.id !== "all" &&
                  selectedCategories.includes(category.id))
                  ? "bg-secondary text-background border-transparent shadow-lg"
                  : "bg-background text-primary border-primary/20 hover:border-secondary"
              }`}
            >
              <span>{category.name}</span>
              <span className="text-xs sm:text-sm opacity-80">
                ({category.count})
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
            {(selectedGenders.length > 0 ||
              priceRange[1] < 50000 ||
              priceSort !== "none") && (
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
              {filteredProducts.length} produit
              {filteredProducts.length > 1 ? "s" : ""} trouvé
              {filteredProducts.length > 1 ? "s" : ""}
              {selectedCategories.length > 0 &&
                !selectedCategories.includes("all") &&
                ` • ${selectedCategories.join(", ")}`}
              {selectedGenders.length > 0 && ` • ${selectedGenders.join(", ")}`}
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
              <p className="text-primary text-lg">Chargement des produits...</p>
            </div>
          </motion.div>
        )}

        {/* Products Grid - Only show when not loading */}
        {!loading && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={
                selectedCategories.join(",") +
                selectedGenders.join(",") +
                priceSort +
                priceRange[1] +
                currentPage
              }
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              <AnimatePresence mode="wait">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    formatPrice={formatPrice}
                    calculateFinalPrice={calculateFinalPrice}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination - Only show if more than 10 products */}
            {filteredProducts.length > productsPerPage && (
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
        {!loading && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-primary/80 mb-6 text-sm sm:text-base">
              Essayez d'ajuster vos filtres
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCategories(["all"]);
                setSelectedGenders([]);
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

      {/* Enhanced Filter Sidebar with Gender, Price, and Sort filters */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        genders={genders}
        selectedGenders={selectedGenders}
        setSelectedGenders={setSelectedGenders}
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

// Product Card (updated with responsive design for 2 items per row)
const ProductCard = ({ product, formatPrice, calculateFinalPrice }) => {
  const { addToCart } = useCartStore();

  const finalPrice = calculateFinalPrice(product);
  const hasDiscount = product.discount > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-background rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
    >
      <Link to={`/products/${product._id}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Badges - Responsive positioning */}
          <div className="absolute top-2 right-2 bg-secondary text-primary px-2 py-1 rounded-full text-[10px] xs:text-xs font-semibold">
            {product.category}
          </div>
          <div className="absolute top-2 left-2 bg-accent text-primary px-2 py-1 rounded-full text-[10px] xs:text-xs font-semibold capitalize">
            {product.gender}
          </div>

          {/* Discount Badge - Responsive size */}
          {hasDiscount && (
            <div className="absolute top-10 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] xs:text-xs font-bold">
              -{product.discount}%
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Product Title - Responsive text size and line clamp */}
        <h3 className="text-xs xs:text-sm sm:text-base font-semibold text-primary mb-2 sm:mb-3 line-clamp-2 min-h-[2.5em]">
          {product.title}
        </h3>

        {/* Price Display - Clean and Professional with responsive sizing */}
        <div className="mb-3 flex-grow">
          <div className="flex items-center space-x-1 xs:space-x-2 flex-wrap">
            <span
              className={`text-sm xs:text-base sm:text-lg font-bold ${
                hasDiscount ? "text-red-600" : "text-secondary"
              }`}
            >
              {formatPrice(finalPrice)}
            </span>

            {hasDiscount && (
              <span className="text-xs xs:text-sm text-primary/60 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button - Responsive text and padding */}
        <motion.button
          onClick={() => addToCart(product)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-primary text-background py-2 px-2 xs:px-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center space-x-1 xs:space-x-2 text-xs xs:text-sm sm:text-base mt-auto"
        >
          <ShoppingCart className="w-3 h-3 xs:w-4 xs:h-4" />
          <span className="truncate text-sm md:text-base">Ajouter</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// Enhanced Filter Sidebar with Gender, Price, and Sort filters
const FilterSidebar = ({
  isOpen,
  onClose,
  genders,
  selectedGenders,
  setSelectedGenders,
  priceRange,
  setPriceRange,
  priceSort,
  setPriceSort,
  formatPrice,
}) => {
  return (
    <AnimatePresence mode="sync">
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

              {/* Gender Filter */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4">
                  Genre
                </h3>
                <div className="space-y-2">
                  {genders.map((gender) => (
                    <motion.label
                      key={gender.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-3 rounded-xl bg-primary/5 border border-primary/10 hover:border-secondary transition-all duration-300 cursor-pointer text-sm sm:text-base"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGenders.includes(gender.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGenders([...selectedGenders, gender.id]);
                          } else {
                            setSelectedGenders(
                              selectedGenders.filter((id) => id !== gender.id)
                            );
                          }
                        }}
                        className="rounded text-secondary border-primary/20 focus:ring-secondary"
                      />
                      <span className="ml-3 text-primary font-semibold capitalize">
                        {gender.name}
                      </span>
                      <span className="ml-auto text-primary/60">
                        ({gender.count})
                      </span>
                    </motion.label>
                  ))}
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
                    setSelectedGenders([]);
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

export default Products;
