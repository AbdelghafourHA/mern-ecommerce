import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  Package,
  ShoppingBag,
  Star,
  Search,
  Upload,
  Users,
  DollarSign,
  ShoppingCart,
  LogOut,
  ArrowLeft,
  Trash,
  Percent,
  Tag,
  ChevronDown,
  X,
  Settings,
  User,
  Key,
  UserPlus,
  Save,
  Shield,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Calendar,
  MapPin,
  Home,
  Building,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useAdminStore } from "../stores/useAdminStore";
import { useProductStore } from "../stores/useProductStore";
import { useCheckoutStore } from "../stores/useCheckoutStore";
import { useAnalyticStore } from "../stores/useAnalyticStore";
import { useShippingStore } from "../stores/useShippingStore";

import toast from "react-hot-toast";

const Admin = () => {
  const { logout, user, getAdminProfile } = useAdminStore();
  const [activeTab, setActiveTab] = useState("products");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getAllCheckouts } = useCheckoutStore();
  const { getAllProducts } = useProductStore();

  useEffect(() => {
    getAdminProfile();
  }, [getAdminProfile]);

  const handleLogout = async () => {
    logout();
  };

  const formatPrice = (price) => {
    return `${price?.toLocaleString("fr-FR") || 0} DA`;
  };

  const tabs = [
    { id: "products", label: "Produits", icon: Package },
    { id: "add", label: "Ajouter", icon: Plus },
    { id: "orders", label: "Commandes", icon: ShoppingBag },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Mobile Header */}
      <div className="lg:hidden bg-primary text-white sticky top-0">
        <div className="flex items-center justify-center p-4">
          <h1 className="text-xl font-bold font-bold01 text-center">
            Dashboard
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex overflow-x-auto border-t border-white/20 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`flex-1 min-w-0 flex flex-col items-center py-3 px-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-secondary text-primary"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <tab.icon size={20} />
              <span className="text-[10px] sm:text-xs mt-1 font-p01 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-24"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="lg:flex">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-primary text-white p-6 pt-16">
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-8 font-bold01 mt-10">
              Dashboard
            </h1>

            <nav className="space-y-2">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-p01 ${
                    activeTab === item.id
                      ? "bg-secondary text-primary shadow-lg"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-base">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:ml-64 w-full min-h-screen">
          {/* Desktop Header */}
          <div className="flex w-full p-6">
            <div className="flex w-full justify-between items-center gap-4">
              {user && (
                <div className="text-left">
                  <p className="text-primary font-p01 font-bold text-md">
                    {user.username}
                  </p>
                  <p className="text-primary/60 text-sm font-bold capitalize">
                    {user.role === "super-admin"
                      ? "Super Administrateur"
                      : "Administrateur"}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold01 text-sm"
              >
                <LogOut size={18} />
                Se déconnecter
              </button>
            </div>
          </div>

          <div className="p-4 lg:p-6 xl:p-8">
            <div className="bg-white rounded-xl shadow-lg border border-primary/10 p-4 lg:p-6">
              {activeTab === "products" && (
                <ProductsManager formatPrice={formatPrice} />
              )}
              {activeTab === "add" && <AddProduct />}
              {activeTab === "orders" && (
                <OrdersManager formatPrice={formatPrice} />
              )}
              {activeTab === "analytics" && (
                <Analytics formatPrice={formatPrice} />
              )}
              {activeTab === "settings" && <SettingsManager />}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

const ProductsManager = ({ formatPrice }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkDiscount, setBulkDiscount] = useState({
    discount: 0,
    categories: [],
    applyToAll: true,
  });
  const [applyingBulkDiscount, setApplyingBulkDiscount] = useState(false);
  const [isBulkDiscountOpen, setIsBulkDiscountOpen] = useState(false);
  const searchTimeout = useRef(null);

  const {
    products,
    getAllProducts,
    loading,
    pagination,
    filters,
    setPage,
    setFilter,
    deleteProduct,
    toggleFeatured,
    productDiscount,
    applyDiscountToAll,
    removeDiscountFromAll,
    updateProduct,
  } = useProductStore();

  useEffect(() => {
    getAllProducts();
  }, [
    pagination.currentPage,
    filters.search,
    filters.category,
    filters.gender,
    filters.maxPrice,
    filters.sort,
  ]);

  const handleSearch = (e) => {
    const value = e.target.value;

    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilter("search", value);
      setPage(1);
    }, 400);
  };

  const handleClearSearch = () => {
    clearTimeout(searchTimeout.current);
    setFilter("search", "");
    setPage(1);
  };

  const staticCategories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const handleDiscountChange = async (productId, newDiscount) => {
    try {
      await productDiscount(productId, newDiscount);
    } catch (error) {
      console.error("Error updating discount:", error);
    }
  };

  const getDisplayPrice = (product) => {
    if (product.category === "Decants" && product.volumePricing) {
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

      const defaultVolume = product.defaultVolume || "10ml";
      const volumePrice = volumePricing[defaultVolume];

      if (volumePrice !== undefined) {
        return volumePrice;
      }
    }

    return product.price;
  };

  const getFinalPrice = (product) => {
    const displayPrice = getDisplayPrice(product);

    if (product.discount > 0) {
      return Math.round(displayPrice * (1 - product.discount / 100));
    }

    return displayPrice;
  };

  const handleBulkDiscount = async () => {
    if (bulkDiscount.discount < 0 || bulkDiscount.discount > 100) {
      toast.error("Le discount doit être entre 0 et 100%");
      return;
    }

    if (!bulkDiscount.applyToAll && bulkDiscount.categories.length === 0) {
      toast.error("Veuillez sélectionner au moins une catégorie");
      return;
    }

    setApplyingBulkDiscount(true);
    try {
      const categories = bulkDiscount.applyToAll ? [] : bulkDiscount.categories;
      await applyDiscountToAll(bulkDiscount.discount, categories);
      toast.success(
        `Discount de ${bulkDiscount.discount}% appliqué avec succès!`
      );
    } catch (error) {
      toast.error("Erreur lors de l'application du discount");
    } finally {
      setApplyingBulkDiscount(false);
    }
  };

  const handleRemoveAllDiscounts = async () => {
    if (!bulkDiscount.applyToAll && bulkDiscount.categories.length === 0) {
      toast.error("Veuillez sélectionner au moins une catégorie");
      return;
    }

    setApplyingBulkDiscount(true);
    try {
      const categories = bulkDiscount.applyToAll ? [] : bulkDiscount.categories;
      await removeDiscountFromAll(categories);
      toast.success("Tous les discounts ont été supprimés avec succès!");
    } catch (error) {
      toast.error("Erreur lors de la suppression des discounts");
    } finally {
      setApplyingBulkDiscount(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit?")) {
      return;
    }

    try {
      await deleteProduct(productId);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleShowAllProducts = () => {
    clearTimeout(searchTimeout.current);
    setFilter("search", "");
    setPage(1);
  };

  if (editingProduct) {
    return (
      <EditProductForm
        product={editingProduct}
        onSave={async (updatedProduct) => {
          await updateProduct(editingProduct._id, updatedProduct);
          setEditingProduct(null);
        }}
        onCancel={() => setEditingProduct(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-primary font-bold01">
            Gestion des Produits
          </h2>
          {!loading && (
            <p className="text-primary/60 text-sm mt-1">
              {pagination.totalProducts} produit
              {pagination.totalProducts > 1 ? "s" : ""} au total
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full lg:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/40"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher produits..."
              value={filters.search || ""}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 lg:py-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm lg:text-base"
            />
            {filters.search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/40 hover:text-primary"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setIsBulkDiscountOpen(!isBulkDiscountOpen)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10"
        >
          <div className="flex items-center">
            <Tag className="text-secondary mr-2" size={20} />
            <span className="font-bold01 text-primary text-sm lg:text-base">
              Discount en Masse
            </span>
          </div>
          <ChevronDown
            size={20}
            className={`transform transition-transform ${
              isBulkDiscountOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isBulkDiscountOpen && (
          <div className="mt-2 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-primary font-bold01 mb-2 text-sm">
                  Pourcentage de Discount
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={bulkDiscount.discount}
                    onChange={(e) =>
                      setBulkDiscount({
                        ...bulkDiscount,
                        discount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-20 lg:w-24 p-2 lg:p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm"
                  />
                  <span className="text-primary font-bold01 text-sm">%</span>
                </div>
              </div>

              <div>
                <label className="block text-primary font-bold01 mb-2 text-sm">
                  Appliquer à
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={bulkDiscount.applyToAll}
                      onChange={() =>
                        setBulkDiscount({
                          ...bulkDiscount,
                          applyToAll: true,
                          categories: [],
                        })
                      }
                      className="text-secondary focus:ring-secondary"
                    />
                    <span className="text-sm">Tous les produits</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={!bulkDiscount.applyToAll}
                      onChange={() =>
                        setBulkDiscount({
                          ...bulkDiscount,
                          applyToAll: false,
                        })
                      }
                      className="text-secondary focus:ring-secondary"
                    />
                    <span className="text-sm">Catégories spécifiques</span>
                  </label>
                </div>
              </div>
            </div>

            {!bulkDiscount.applyToAll && (
              <div className="mb-4">
                <label className="block text-primary font-bold01 mb-2 text-sm">
                  Sélectionner les catégories
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {staticCategories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-primary/20 shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={bulkDiscount.categories.includes(category)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...bulkDiscount.categories, category]
                            : bulkDiscount.categories.filter(
                                (c) => c !== category
                              );
                          setBulkDiscount({
                            ...bulkDiscount,
                            categories: newCategories,
                          });
                        }}
                        className="text-secondary focus:ring-secondary"
                      />
                      <span className="text-primary font-bold01 text-xs">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleBulkDiscount}
                disabled={
                  applyingBulkDiscount ||
                  bulkDiscount.discount === 0 ||
                  (!bulkDiscount.applyToAll &&
                    bulkDiscount.categories.length === 0)
                }
                className="flex-1 bg-green-600 text-white py-2 lg:py-3 rounded-xl font-bold01 hover:bg-green-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
              >
                {applyingBulkDiscount ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Application...</span>
                  </>
                ) : (
                  <>
                    <Percent size={16} />
                    <span>Appliquer {bulkDiscount.discount}%</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRemoveAllDiscounts}
                disabled={applyingBulkDiscount}
                className="flex-1 bg-red-600 text-white py-2 lg:py-3 rounded-xl font-bold01 hover:bg-red-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
              >
                {applyingBulkDiscount ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Supprimer Discounts</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary mx-auto mb-4"></div>
              <p className="text-primary text-lg">Chargement des produits...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {filters.search ? "Aucun produit trouvé" : "Aucun produit"}
                  </h3>
                  <p className="text-primary/80 mb-6">
                    {filters.search
                      ? "Essayez avec d'autres mots-clés"
                      : "Commencez par ajouter des produits"}
                  </p>
                  {filters.search && (
                    <button
                      onClick={handleShowAllProducts}
                      className="bg-accent text-primary px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Afficher tous les produits
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full min-w-[800px] xl:min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-primary/10 bg-primary/5">
                      <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
                        Produit
                      </th>
                      <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
                        Catégorie
                      </th>
                      <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
                        Prix
                      </th>
                      <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
                        Discount
                      </th>
                      <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
                        Final
                      </th>
                      <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const displayPrice = getDisplayPrice(product);
                      const finalPrice = getFinalPrice(product);
                      const savings = displayPrice - finalPrice;

                      return (
                        <tr
                          key={product._id}
                          className="border-b border-primary/5 hover:bg-primary/5 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-12 h-12 rounded-lg object-cover border border-primary/10"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-primary font-bold01 text-sm line-clamp-2">
                                  {product.title}
                                </p>
                                <p className="text-xs text-primary/60 capitalize">
                                  {Array.isArray(product.gender)
                                    ? product.gender.join(" / ")
                                    : product.gender}
                                </p>
                                {product.category === "Decants" && (
                                  <div className="flex items-center space-x-1 mt-1">
                                    {product.availableSizes?.map((size) => (
                                      <span
                                        key={size}
                                        className={`text-[10px] px-1 py-0.5 rounded ${
                                          size ===
                                          (product.defaultVolume || "10ml")
                                            ? "bg-secondary/20 text-secondary"
                                            : "bg-primary/10 text-primary/60"
                                        }`}
                                      >
                                        {size}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold01">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-primary font-p01 text-sm">
                              {formatPrice(displayPrice)}
                              {product.category === "Decants" && (
                                <span className="text-xs text-primary/60 block">
                                  {product.defaultVolume || "10ml"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={product.discount || 0}
                                onChange={(e) =>
                                  handleDiscountChange(
                                    product._id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-14 p-2 border border-primary/20 rounded-lg text-center text-sm focus:outline-none focus:border-secondary"
                              />
                              <span className="text-primary/60 text-xs">%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div
                                className={`font-semibold font-p01 text-sm ${
                                  product.discount > 0
                                    ? "text-green-600"
                                    : "text-primary"
                                }`}
                              >
                                {formatPrice(finalPrice)}
                              </div>
                              {savings > 0 && (
                                <div className="text-xs text-red-600 font-p01">
                                  -{formatPrice(savings)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleFeatured(product._id)}
                                className={`p-2 rounded-full transition-colors ${
                                  product.isFeatured
                                    ? "bg-accent/20 text-accent"
                                    : "bg-primary/10 text-primary/40 hover:text-primary/60"
                                }`}
                              >
                                <Star
                                  size={16}
                                  fill={
                                    product.isFeatured ? "currentColor" : "none"
                                  }
                                />
                              </button>
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="lg:hidden space-y-4">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {filters.search ? "Aucun produit trouvé" : "Aucun produit"}
                  </h3>
                  <p className="text-primary/80 mb-6">
                    {filters.search
                      ? "Essayez avec d'autres mots-clés"
                      : "Commencez par ajouter des produits"}
                  </p>
                  {filters.search && (
                    <button
                      onClick={handleShowAllProducts}
                      className="bg-accent text-primary px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Afficher tous les produits
                    </button>
                  )}
                </div>
              ) : (
                products.map((product) => {
                  const displayPrice = getDisplayPrice(product);
                  const finalPrice = getFinalPrice(product);
                  const savings = displayPrice - finalPrice;

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-xl border border-primary/10 p-4 shadow-sm"
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-16 h-16 rounded-lg object-cover border border-primary/10 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-primary font-bold01 text-sm line-clamp-2 mb-1">
                            {product.title}
                          </h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold01">
                              {product.category}
                            </span>
                            <span className="text-primary/60 text-xs capitalize">
                              {product.gender}
                            </span>
                          </div>
                          {product.category === "Decants" && (
                            <div className="flex items-center space-x-1 mb-2">
                              {product.availableSizes?.map((size) => (
                                <span
                                  key={size}
                                  className={`text-[10px] px-1 py-0.5 rounded ${
                                    size === (product.defaultVolume || "10ml")
                                      ? "bg-secondary/20 text-secondary"
                                      : "bg-primary/10 text-primary/60"
                                  }`}
                                >
                                  {size}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-primary/60 text-xs mb-1">
                            {product.category === "Decants"
                              ? "Prix (10ml)"
                              : "Prix Original"}
                          </p>
                          <p className="font-semibold text-primary text-sm">
                            {formatPrice(displayPrice)}
                            {product.category === "Decants" && (
                              <span className="block text-xs text-primary/60">
                                {product.defaultVolume || "10ml"}
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-primary/60 text-xs mb-1">
                            Prix Final
                          </p>
                          <p
                            className={`font-semibold text-sm ${
                              product.discount > 0
                                ? "text-green-600"
                                : "text-primary"
                            }`}
                          >
                            {formatPrice(finalPrice)}
                          </p>
                          {savings > 0 && (
                            <p className="text-red-600 text-xs font-bold01">
                              Économie: {formatPrice(savings)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-primary/60 text-xs">
                            Discount:
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={product.discount || 0}
                            onChange={(e) =>
                              handleDiscountChange(
                                product._id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-14 p-1 border border-primary/20 rounded text-center text-xs focus:outline-none focus:border-secondary"
                          />
                          <span className="text-primary/60 text-xs">%</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleFeatured(product._id)}
                            className={`p-1 rounded-full ${
                              product.isFeatured
                                ? "bg-accent/20 text-accent"
                                : "bg-primary/10 text-primary/40"
                            }`}
                          >
                            <Star
                              size={14}
                              fill={
                                product.isFeatured ? "currentColor" : "none"
                              }
                            />
                          </button>
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-1 bg-primary/10 text-primary rounded-lg"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-1 bg-red-100 text-red-600 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 pt-6 border-t border-primary/10">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() =>
                      setPage(Math.max(1, pagination.currentPage - 1))
                    }
                    disabled={pagination.currentPage === 1}
                    className={`p-2 rounded-full ${
                      pagination.currentPage === 1
                        ? "text-primary/30 cursor-not-allowed"
                        : "text-primary hover:bg-primary/10 cursor-pointer"
                    }`}
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <div className="flex items-center space-x-2">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        let pageNumber;
                        if (pagination.totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (
                          pagination.currentPage >=
                          pagination.totalPages - 2
                        ) {
                          pageNumber = pagination.totalPages - 4 + i;
                        } else {
                          pageNumber = pagination.currentPage - 2 + i;
                        }

                        return pageNumber <= pagination.totalPages ? (
                          <button
                            key={pageNumber}
                            onClick={() => setPage(pageNumber)}
                            className={`w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                              pagination.currentPage === pageNumber
                                ? "bg-secondary text-background"
                                : "text-primary hover:bg-primary/10"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        ) : null;
                      }
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setPage(
                        Math.min(
                          pagination.totalPages,
                          pagination.currentPage + 1
                        )
                      )
                    }
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`p-2 rounded-full ${
                      pagination.currentPage === pagination.totalPages
                        ? "text-primary/30 cursor-not-allowed"
                        : "text-primary hover:bg-primary/10 cursor-pointer"
                    }`}
                  >
                    <ChevronRight size={24} />
                  </button>

                  <span className="text-primary/60 text-sm ml-4">
                    Page {pagination.currentPage} sur {pagination.totalPages}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const OrdersManager = ({ formatPrice }) => {
  const {
    checkouts,
    getAllCheckouts,
    updateCheckoutStatus,
    deleteCheckout,
    pagination,
    setPage,
    loading,
  } = useCheckoutStore();
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    getAllCheckouts();
  }, [pagination.currentPage]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateCheckoutStatus(orderId, newStatus);
      toast.success("Statut mis à jour!");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (selectedOrder) {
    return (
      <OrderDetails
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        formatPrice={formatPrice}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-primary font-bold01">
            Gestion des Commandes
          </h2>
          {!loading && (
            <p className="text-primary/60 text-sm mt-1">
              {pagination.totalCheckouts} commande
              {pagination.totalCheckouts > 1 ? "s" : ""} au total
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-primary text-lg">Chargement des commandes...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {checkouts.length === 0 ? (
              <div className="text-center py-8 text-primary/60 text-sm">
                Aucune commande pour le moment
              </div>
            ) : (
              checkouts.map((order) => (
                <div
                  key={order._id}
                  className="bg-primary/5 rounded-xl p-4 border border-primary/10"
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="text-base lg:text-lg font-bold text-primary font-bold01">
                        Commande #{order._id?.slice(-6).toUpperCase() || "N/A"}
                      </h3>
                      <p className="text-primary/60 text-xs lg:text-sm">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <select
                      value={order.status || "pending"}
                      onChange={(e) =>
                        handleUpdateStatus(order._id, e.target.value)
                      }
                      disabled={loading}
                      className="px-3 py-1 rounded-full text-xs border border-primary/20 focus:outline-none focus:border-secondary w-fit bg-white"
                    >
                      <option value="pending">En attente</option>
                      <option value="processing">En traitement</option>
                      <option value="completed">Complétée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-primary/60 text-xs font-bold01">
                        Client
                      </p>
                      <p className="text-primary font-semibold font-bold01 text-sm">
                        {order.firstName} {order.lastName}
                      </p>
                      <p className="text-primary/80 text-xs truncate">
                        {order.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-primary/60 text-xs font-bold01">
                        Produits
                      </p>
                      <p className="text-primary font-semibold font-p01 text-sm">
                        {order.orderItems?.length || 0} article(s)
                      </p>
                    </div>

                    <div>
                      <p className="text-primary/60 text-xs font-bold01">
                        Total
                      </p>
                      <p className="text-secondary font-bold text-base font-p01">
                        {formatPrice(order.totalPrice || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold01 ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status === "completed"
                          ? "Complétée"
                          : order.status === "processing"
                          ? "En traitement"
                          : order.status === "cancelled"
                          ? "Annulée"
                          : "En attente"}
                      </span>

                      <span className="text-primary/60 text-xs">
                        {order.deliveryType === "home"
                          ? "🏠 Domicile"
                          : "🏢 Bureau"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="cursor-pointer bg-secondary text-primary px-3 py-2 rounded-xl font-bold01 hover:shadow-lg transition-all duration-300 text-xs"
                      >
                        Voir détails
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm("Supprimer cette commande?")) {
                            deleteCheckout(order._id);
                          }
                        }}
                      >
                        <Trash
                          size={18}
                          className="cursor-pointer text-red-500"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination for Checkouts */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 pt-6 border-t border-primary/10">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    setPage(Math.max(1, pagination.currentPage - 1))
                  }
                  disabled={pagination.currentPage === 1}
                  className={`p-2 rounded-full ${
                    pagination.currentPage === 1
                      ? "text-primary/30 cursor-not-allowed"
                      : "text-primary hover:bg-primary/10 cursor-pointer"
                  }`}
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNumber;
                      if (pagination.totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageNumber = pagination.totalPages - 4 + i;
                      } else {
                        pageNumber = pagination.currentPage - 2 + i;
                      }

                      return pageNumber <= pagination.totalPages ? (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                            pagination.currentPage === pageNumber
                              ? "bg-secondary text-background"
                              : "text-primary hover:bg-primary/10"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ) : null;
                    }
                  )}
                </div>

                <button
                  onClick={() =>
                    setPage(
                      Math.min(
                        pagination.totalPages,
                        pagination.currentPage + 1
                      )
                    )
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`p-2 rounded-full ${
                    pagination.currentPage === pagination.totalPages
                      ? "text-primary/30 cursor-not-allowed"
                      : "text-primary hover:bg-primary/10 cursor-pointer"
                  }`}
                >
                  <ChevronRight size={24} />
                </button>

                <span className="text-primary/60 text-sm ml-4">
                  Page {pagination.currentPage} sur {pagination.totalPages}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const Analytics = ({ formatPrice }) => {
  const {
    productsAnalytics,
    analyticsStats,
    getAllAnalytics,
    loading,
    error,
    resetAnalytics,
  } = useAnalyticStore();

  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAnalyticsData = async (force = false) => {
    const success = await getAllAnalytics(force);
    if (success) {
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const handleRefresh = () => {
    loadAnalyticsData(true);
  };

  const handleReset = () => {
    resetAnalytics();
    setLastUpdated(null);
  };

  const productsData = productsAnalytics || {};
  const statsData = analyticsStats || {};

  const {
    totalProducts = 0,
    featuredProducts = 0,
    categoryDistribution = [],
    topSellingProducts = [],
  } = productsData;

  const {
    totalCheckouts = 0,
    totalRevenue = 0,
    completedOrders = 0,
    processingOrders = 0,
    pendingOrders = 0,
    cancelledOrders = 0,
    averageOrderValue = 0,
  } = statsData;

  const calculatePercentage = (count, total) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  if (loading && !productsAnalytics && !analyticsStats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Réessayer
            </button>
            <button
              onClick={handleReset}
              className="flex-1 border border-red-300 text-red-600 py-3 px-4 rounded-xl font-semibold hover:bg-red-50 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!productsAnalytics && !analyticsStats && !loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-16 h-16 text-primary/40" />
          </div>
          <h3 className="text-2xl font-bold text-primary mb-3">
            Aucune donnée
          </h3>
          <p className="text-primary/60 mb-8 max-w-md">
            Aucune donnée statistique disponible.
          </p>
          <button
            onClick={handleRefresh}
            className="bg-secondary text-primary py-3 px-8 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Charger les données
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Revenu total",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Commandes",
      value: totalCheckouts.toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Produits en vedette",
      value: featuredProducts,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Panier moyen",
      value: formatPrice(averageOrderValue),
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  const statusStats = [
    {
      label: "Complétée",
      count: completedOrders,
      color: "bg-green-500",
      textColor: "text-green-700",
      percentage: calculatePercentage(completedOrders, totalCheckouts),
    },
    {
      label: "En traitement",
      count: processingOrders,
      color: "bg-blue-500",
      textColor: "text-blue-700",
      percentage: calculatePercentage(processingOrders, totalCheckouts),
    },
    {
      label: "En attente",
      count: pendingOrders,
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      percentage: calculatePercentage(pendingOrders, totalCheckouts),
    },
    {
      label: "Annulée",
      count: cancelledOrders,
      color: "bg-red-500",
      textColor: "text-red-700",
      percentage: calculatePercentage(cancelledOrders, totalCheckouts),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">
            Tableau de bord
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="text-sm text-primary/60">
              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {new Date(lastUpdated).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <RefreshCw size={16} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-2xl border border-primary/10 p-5`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-primary/60 text-sm font-medium mb-2">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-primary">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-primary/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary">Catégories</h3>
              <span className="text-primary/60 text-sm">
                {totalProducts} produits
              </span>
            </div>

            <div className="space-y-4">
              {categoryDistribution.length > 0 ? (
                categoryDistribution.map((category, index) => {
                  const percentage = calculatePercentage(
                    category.count,
                    totalProducts
                  );
                  return (
                    <div key={category._id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-medium capitalize">
                          {category._id}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-primary/60 text-sm">
                            {percentage}%
                          </span>
                          <span className="text-primary font-semibold">
                            {category.count}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                  <p className="text-primary/60">Aucune catégorie</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-primary/10 p-6">
            <h3 className="text-lg font-bold text-primary mb-6">
              Meilleures ventes
            </h3>

            <div className="space-y-4">
              {topSellingProducts.length > 0 ? (
                topSellingProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center p-4 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors"
                  >
                    <div className="w-10 h-10 bg-secondary text-primary rounded-xl flex items-center justify-center font-bold text-sm mr-4">
                      {index + 1}
                    </div>

                    <div className="w-14 h-14 mr-4">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary truncate">
                        {product.title}
                      </p>
                      <p className="text-primary/60 text-sm">
                        {product.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-secondary text-sm font-semibold">
                        {product.salesCount || 0} ventes
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                  <p className="text-primary/60">Aucune vente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-primary/10 p-6">
            <h3 className="text-lg font-bold text-primary mb-6">
              Statut commandes
            </h3>

            <div className="space-y-5">
              {statusStats.map((status, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`} />
                      <span className="text-primary font-medium">
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-primary/60 text-sm">
                        {status.percentage}%
                      </span>
                      <span className={`font-semibold ${status.textColor}`}>
                        {status.count}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${status.color}`}
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "Parfums",
    gender: [],
    image: "",
    volumePricing: {
      "10ml": "",
      "20ml": "",
      "30ml": "",
    },
    availableSizes: ["10ml", "20ml", "30ml"],
    defaultVolume: "10ml",
  });

  const [showVolumePricing, setShowVolumePricing] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const { createProduct, loading } = useProductStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.gender.length === 0) {
      toast.error("Veuillez sélectionner au moins un genre");
      return;
    }
    try {
      let basePrice = formData.price;
      if (formData.category === "Decants") {
        basePrice = formData.volumePricing["10ml"] || formData.price;
      }

      const productData = {
        ...formData,
        price: parseFloat(basePrice),
        volumePricing:
          formData.category === "Decants"
            ? Object.fromEntries(
                Object.entries(formData.volumePricing)
                  .filter(([_, value]) => value !== "")
                  .map(([size, value]) => [size, parseFloat(value)])
              )
            : {},
        availableSizes:
          formData.category === "Decants" ? formData.availableSizes : [],
        defaultVolume:
          formData.category === "Decants" ? formData.defaultVolume : null,
      };

      await createProduct(productData);
      toast.success("Produit ajouté avec succès!");

      setFormData({
        title: "",
        price: "",
        description: "",
        category: "Parfums",
        gender: "femme",
        image: "",
        volumePricing: {
          "10ml": "",
          "20ml": "",
          "30ml": "",
        },
        availableSizes: ["10ml", "20ml", "30ml"],
        defaultVolume: "10ml",
      });
      setShowVolumePricing(false);
    } catch (error) {
      toast.error("Erreur lors de l'ajout du produit");
    }
  };

  const handleVolumePricingChange = (size, value) => {
    const newVolumePricing = {
      ...formData.volumePricing,
      [size]: value,
    };

    setFormData({
      ...formData,
      volumePricing: newVolumePricing,
      price: size === "10ml" ? value : formData.price,
    });
  };

  const handleAvailableSizeToggle = (size) => {
    const newSizes = formData.availableSizes.includes(size)
      ? formData.availableSizes.filter((s) => s !== size)
      : [...formData.availableSizes, size];

    setFormData({
      ...formData,
      availableSizes: newSizes,
      defaultVolume:
        !newSizes.includes(formData.defaultVolume) && newSizes.length > 0
          ? newSizes[0]
          : formData.defaultVolume,
    });
  };

  const calculateBasePrice = () => {
    if (formData.category !== "Decants") return formData.price;

    const tenMlPrice = formData.volumePricing["10ml"];
    if (tenMlPrice && tenMlPrice !== "") {
      return tenMlPrice;
    }

    return formData.price || 0;
  };

  return (
    <div>
      <h2 className="text-xl lg:text-2xl font-bold text-primary font-bold01 mb-6">
        Ajouter un Produit
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                Nom du Produit *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm lg:text-base"
                placeholder="Entrez le nom du produit"
              />
            </div>

            <div>
              <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary h-32 resize-none text-sm lg:text-base"
                placeholder="Décrivez le produit"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                  {formData.category === "Decants"
                    ? "Prix de base (10ml) *"
                    : "Prix (DA) *"}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={calculateBasePrice()}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm lg:text-base"
                  placeholder="0"
                  readOnly={formData.category === "Decants"}
                />
                {formData.category === "Decants" && (
                  <p className="text-primary/60 text-xs mt-1">
                    Ce prix sera automatiquement rempli avec le prix du 10ml
                  </p>
                )}
              </div>

              <div>
                <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                  Catégorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    setFormData({
                      ...formData,
                      category: newCategory,
                      volumePricing:
                        newCategory === "Decants"
                          ? formData.volumePricing
                          : {
                              "10ml": "",
                              "20ml": "",
                              "30ml": "",
                            },
                      availableSizes:
                        newCategory === "Decants"
                          ? formData.availableSizes
                          : [],
                      defaultVolume:
                        newCategory === "Decants"
                          ? formData.defaultVolume
                          : null,
                    });
                    setShowVolumePricing(newCategory === "Decants");
                  }}
                  className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm lg:text-base"
                >
                  <option value="Parfums">Parfums</option>
                  <option value="Decants">Decants</option>
                  <option value="Cosmétiques">Cosmétiques</option>
                  <option value="Cadeaux">Cadeaux</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                Genre *
              </label>
              <div className="flex flex-wrap gap-4 mt-2">
                {["femme", "homme"].map((gender) => (
                  <label key={gender} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.gender.includes(gender)}
                      onChange={(e) => {
                        const newGender = e.target.checked
                          ? [...formData.gender, gender]
                          : formData.gender.filter((g) => g !== gender);
                        setFormData({ ...formData, gender: newGender });
                      }}
                      className="text-secondary focus:ring-secondary"
                    />
                    <span className="text-primary capitalize text-sm">
                      {gender}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {formData.category === "Decants" && (
              <div className="pt-4 border-t border-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold01 text-primary">
                    Configuration des Decants
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowVolumePricing(!showVolumePricing)}
                    className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors text-sm"
                  >
                    <ChevronDown
                      size={16}
                      className={`transform transition-transform ${
                        showVolumePricing ? "rotate-180" : ""
                      }`}
                    />
                    <span>{showVolumePricing ? "Masquer" : "Afficher"}</span>
                  </button>
                </div>

                {showVolumePricing && (
                  <div className="space-y-4 bg-primary/5 p-4 rounded-xl">
                    <div>
                      <label className="block text-primary font-bold01 mb-2 text-sm">
                        Tailles disponibles
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["10ml", "20ml", "30ml"].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleAvailableSizeToggle(size)}
                            className={`px-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
                              formData.availableSizes.includes(size)
                                ? "bg-primary text-background border-primary"
                                : "bg-background text-primary border-primary/20 hover:border-primary"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <p className="text-primary/60 text-xs mt-2">
                        Sélectionnez les tailles disponibles pour ce decant
                      </p>
                    </div>

                    <div>
                      <label className="block text-primary font-bold01 mb-2 text-sm">
                        Taille par défaut
                      </label>
                      <select
                        value={formData.defaultVolume}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultVolume: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-primary/20 rounded-lg focus:outline-none focus:border-secondary text-sm"
                      >
                        {formData.availableSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-primary font-bold01 mb-3 text-sm">
                        Prix par taille (DA) *
                      </label>
                      <div className="space-y-3">
                        {["10ml", "20ml", "30ml"].map((size) => (
                          <div
                            key={size}
                            className="flex items-center justify-between"
                          >
                            <span className="text-primary font-bold01 text-base w-16">
                              {size}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.volumePricing[size] || ""}
                              onChange={(e) =>
                                handleVolumePricingChange(size, e.target.value)
                              }
                              disabled={!formData.availableSizes.includes(size)}
                              className={`w-32 p-2 border rounded-lg focus:outline-none text-sm ${
                                !formData.availableSizes.includes(size)
                                  ? "bg-primary/10 border-primary/10 text-primary/40 cursor-not-allowed"
                                  : "border-primary/20 focus:border-secondary"
                              }`}
                              placeholder="Prix"
                              required={formData.availableSizes.includes(size)}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-primary/60 text-xs mt-2">
                        * Définissez des prix différents pour chaque taille. Le
                        prix du 10ml sera utilisé comme prix de base.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                Image du Produit *
              </label>
              <div className="border-2 border-dashed border-primary/20 rounded-xl p-4 lg:p-6 text-center hover:border-secondary transition-colors">
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer block">
                  <Upload className="mx-auto text-primary/40 mb-2" size={32} />
                  <p className="text-primary font-bold01 text-sm lg:text-base">
                    Cliquer pour uploader
                  </p>
                  <p className="text-primary/60 text-xs mt-1">
                    PNG, JPG, JPEG (Max. 5MB)
                  </p>
                </label>
              </div>
            </div>

            {formData.image && (
              <div>
                <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                  Aperçu
                </label>
                <img
                  src={formData.image}
                  alt="Aperçu"
                  className="w-32 h-32 lg:w-40 lg:h-40 rounded-lg object-cover border border-primary/20 mx-auto"
                />
              </div>
            )}

            {formData.category === "Decants" && showVolumePricing && (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <h4 className="font-bold01 text-primary text-sm mb-3">
                  Récapitulatif des prix
                </h4>
                <div className="space-y-2">
                  {Object.entries(formData.volumePricing)
                    .filter(
                      ([size, price]) =>
                        price !== "" && formData.availableSizes.includes(size)
                    )
                    .map(([size, price]) => (
                      <div
                        key={size}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-primary/80">{size}:</span>
                        <span className="font-bold01 text-secondary">
                          {parseFloat(price).toLocaleString("fr-FR")} DA
                          {size === formData.defaultVolume && (
                            <span className="ml-2 text-xs bg-secondary text-primary px-2 py-0.5 rounded">
                              Défaut
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                </div>
                {formData.availableSizes.length === 0 && (
                  <p className="text-red-600 text-xs mt-2">
                    ⚠️ Vous devez sélectionner au moins une taille
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={
              loading ||
              (formData.category === "Decants" &&
                formData.availableSizes.length === 0)
            }
            className={`w-full lg:w-64 py-3 lg:py-4 rounded-xl font-bold01 text-base lg:text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 ${
              formData.category === "Decants" &&
              formData.availableSizes.length === 0
                ? "bg-red-600 text-white cursor-not-allowed"
                : "bg-secondary text-primary"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Ajout en cours...</span>
              </div>
            ) : (
              "Ajouter le Produit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const EditProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: product.title || "",
    description: product.description || "",
    price: product.price || "",
    category: product.category || "Parfums",
    gender: Array.isArray(product.gender)
      ? product.gender
      : product.gender
      ? [product.gender]
      : [],
    image: product.image || "",
    volumePricing: product.volumePricing
      ? (() => {
          if (
            product.volumePricing instanceof Map ||
            product.volumePricing[Symbol.iterator]
          ) {
            try {
              return Object.fromEntries(product.volumePricing);
            } catch {
              return { "10ml": "", "20ml": "", "30ml": "" };
            }
          }
          if (
            typeof product.volumePricing === "object" &&
            product.volumePricing !== null
          ) {
            return {
              "10ml": product.volumePricing["10ml"] || "",
              "20ml": product.volumePricing["20ml"] || "",
              "30ml": product.volumePricing["30ml"] || "",
              ...product.volumePricing,
            };
          }
          return { "10ml": "", "20ml": "", "30ml": "" };
        })()
      : { "10ml": "", "20ml": "", "30ml": "" },
    availableSizes: product.availableSizes || ["10ml", "20ml", "30ml"],
    defaultVolume: product.defaultVolume || "10ml",
  });

  const [showVolumePricing, setShowVolumePricing] = useState(
    product.category === "Decants"
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      gender: formData.gender,
      image: formData.image,
    };

    if (formData.category === "Decants") {
      productData.volumePricing = Object.fromEntries(
        Object.entries(formData.volumePricing)
          .filter(([_, value]) => value !== "" && !isNaN(parseFloat(value)))
          .map(([size, value]) => [size, parseFloat(value)])
      );
      productData.availableSizes = formData.availableSizes;
      productData.defaultVolume = formData.defaultVolume;
    } else {
      productData.volumePricing = {};
      productData.availableSizes = [];
      productData.defaultVolume = null;
    }

    onSave(productData);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVolumePricingChange = (size, value) => {
    const newVolumePricing = {
      ...formData.volumePricing,
      [size]: value,
    };

    setFormData({
      ...formData,
      volumePricing: newVolumePricing,
      price: size === "10ml" ? value : formData.price,
    });
  };

  const handleAvailableSizeToggle = (size) => {
    const newSizes = formData.availableSizes.includes(size)
      ? formData.availableSizes.filter((s) => s !== size)
      : [...formData.availableSizes, size];

    setFormData({
      ...formData,
      availableSizes: newSizes,
      defaultVolume:
        !newSizes.includes(formData.defaultVolume) && newSizes.length > 0
          ? newSizes[0]
          : formData.defaultVolume,
    });
  };

  const calculateBasePrice = () => {
    if (formData.category !== "Decants") return formData.price;

    const tenMlPrice = formData.volumePricing["10ml"];
    if (tenMlPrice && tenMlPrice !== "") {
      return tenMlPrice;
    }

    return formData.price || 0;
  };

  return (
    <div className="bg-white rounded-xl border border-primary/10 p-4 lg:p-6">
      <h3 className="text-xl font-bold text-primary font-p01 mb-6">
        Modifier le Produit
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                Nom du Produit
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm lg:text-base"
              />
            </div>

            <div>
              <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary h-32 resize-none text-sm lg:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                  {formData.category === "Decants"
                    ? "Prix de base (10ml)"
                    : "Prix (DA)"}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={calculateBasePrice()}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm lg:text-base"
                  readOnly={formData.category === "Decants"}
                />
                {formData.category === "Decants" && (
                  <p className="text-primary/60 text-xs mt-1">
                    Prix de référence pour le 10ml (rempli automatiquement)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    const isChangingFromDecants =
                      formData.category === "Decants";

                    setFormData({
                      ...formData,
                      category: newCategory,
                      volumePricing:
                        newCategory === "Decants"
                          ? formData.volumePricing
                          : { "10ml": "", "20ml": "", "30ml": "" },
                      availableSizes:
                        newCategory === "Decants"
                          ? formData.availableSizes
                          : [],
                      defaultVolume:
                        newCategory === "Decants"
                          ? formData.defaultVolume
                          : null,
                    });
                    setShowVolumePricing(newCategory === "Decants");
                  }}
                  className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm lg:text-base"
                >
                  <option value="Parfums">Parfums</option>
                  <option value="Decants">Decants</option>
                  <option value="Cosmétiques">Cosmétiques</option>
                  <option value="Cadeaux">Cadeaux</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                Genre *
              </label>
              <div className="flex flex-wrap gap-4 mt-2">
                {["femme", "homme"].map((gender) => (
                  <label key={gender} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.gender.includes(gender)}
                      onChange={(e) => {
                        const newGender = e.target.checked
                          ? [...formData.gender, gender]
                          : formData.gender.filter((g) => g !== gender);
                        setFormData({ ...formData, gender: newGender });
                      }}
                      className="text-secondary focus:ring-secondary"
                    />
                    <span className="text-primary capitalize text-sm">
                      {gender}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {formData.category === "Decants" && (
              <div className="pt-4 border-t border-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold01 text-primary">
                    Configuration des Decants
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowVolumePricing(!showVolumePricing)}
                    className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors text-sm"
                  >
                    <ChevronDown
                      size={16}
                      className={`transform transition-transform ${
                        showVolumePricing ? "rotate-180" : ""
                      }`}
                    />
                    <span>{showVolumePricing ? "Masquer" : "Afficher"}</span>
                  </button>
                </div>

                {showVolumePricing && (
                  <div className="space-y-4 bg-primary/5 p-4 rounded-xl">
                    <div>
                      <label className="block text-primary font-bold01 mb-2 text-sm">
                        Tailles disponibles
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["10ml", "20ml", "30ml"].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleAvailableSizeToggle(size)}
                            className={`px-3 py-2 rounded-lg border transition-all duration-300 text-sm ${
                              formData.availableSizes.includes(size)
                                ? "bg-primary text-background border-primary"
                                : "bg-background text-primary border-primary/20 hover:border-primary"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <p className="text-primary/60 text-xs mt-2">
                        Sélectionnez les tailles disponibles pour ce decant
                      </p>
                    </div>

                    <div>
                      <label className="block text-primary font-bold01 mb-2 text-sm">
                        Taille par défaut
                      </label>
                      <select
                        value={formData.defaultVolume}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaultVolume: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-primary/20 rounded-lg focus:outline-none focus:border-secondary text-sm"
                      >
                        {formData.availableSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-primary font-bold01 mb-3 text-sm">
                        Prix par taille (DA)
                      </label>
                      <div className="space-y-3">
                        {["10ml", "20ml", "30ml"].map((size) => (
                          <div
                            key={size}
                            className="flex items-center justify-between"
                          >
                            <span className="text-primary font-bold01 text-base w-16">
                              {size}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.volumePricing[size] || ""}
                              onChange={(e) =>
                                handleVolumePricingChange(size, e.target.value)
                              }
                              disabled={!formData.availableSizes.includes(size)}
                              className={`w-32 p-2 border rounded-lg focus:outline-none text-sm ${
                                !formData.availableSizes.includes(size)
                                  ? "bg-primary/10 border-primary/10 text-primary/40 cursor-not-allowed"
                                  : "border-primary/20 focus:border-secondary"
                              }`}
                              placeholder="Prix"
                              required={formData.availableSizes.includes(size)}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-primary/60 text-xs mt-2">
                        * Définissez des prix différents pour chaque taille
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                Image du Produit
              </label>
              <div className="border-2 border-dashed border-primary/20 rounded-xl p-4 lg:p-6 text-center hover:border-secondary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="edit-image-upload"
                />
                <label
                  htmlFor="edit-image-upload"
                  className="cursor-pointer block"
                >
                  <Edit3 className="mx-auto text-primary/40 mb-2" size={32} />
                  <p className="text-primary font-bold01 text-sm lg:text-base">
                    Changer l'image
                  </p>
                  <p className="text-primary/60 text-xs mt-1">
                    PNG, JPG, JPEG (Max. 5MB)
                  </p>
                </label>
              </div>
            </div>

            {formData.image && (
              <div className="text-center">
                <label className="block text-primary font-bold01 mb-2 text-sm lg:text-base">
                  Aperçu
                </label>
                <img
                  src={formData.image}
                  alt="Aperçu"
                  className="w-32 h-32 lg:w-40 lg:h-40 rounded-lg object-cover border border-primary/20 mx-auto"
                />
              </div>
            )}

            {formData.category === "Decants" && showVolumePricing && (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <h4 className="font-bold01 text-primary text-base mb-3">
                  Récapitulatif des prix
                </h4>
                <div className="space-y-2">
                  {Object.entries(formData.volumePricing)
                    .filter(
                      ([size, price]) =>
                        price !== "" &&
                        !isNaN(parseFloat(price)) &&
                        formData.availableSizes.includes(size)
                    )
                    .map(([size, price]) => (
                      <div
                        key={size}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-primary/80">{size}:</span>
                        <span className="font-p01 text-secondary">
                          {parseFloat(price).toLocaleString("fr-FR")} DA
                          {size === formData.defaultVolume && (
                            <span className="ml-2 text-xs bg-secondary text-primary px-2 py-0.5 rounded">
                              Défaut
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                </div>
                {formData.availableSizes.length === 0 && (
                  <p className="text-red-600 text-xs mt-2">
                    ⚠️ Vous devez sélectionner au moins une taille
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={
              formData.category === "Decants" &&
              formData.availableSizes.length === 0
            }
            className={`flex-1 py-3 rounded-xl font-bold01 hover:shadow-lg transition-all duration-300 text-sm lg:text-base ${
              formData.category === "Decants" &&
              formData.availableSizes.length === 0
                ? "bg-red-600 text-white cursor-not-allowed"
                : "bg-secondary text-primary"
            }`}
          >
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-primary/20 text-primary py-3 rounded-xl font-bold01 hover:border-secondary hover:text-secondary transition-all duration-300 text-sm lg:text-base"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

const OrderDetails = ({ order, onBack, formatPrice }) => {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-primary hover:text-secondary transition-colors text-sm lg:text-base"
        >
          <ArrowLeft size={18} />
          <span>Retour aux commandes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-primary/10 p-4 lg:p-6">
            <h3 className="text-lg font-bold text-primary font-p01 mb-4">
              Articles commandés
            </h3>
            <div className="space-y-4">
              {order.orderItems?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-primary/10 pb-4 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-primary font-bold01 text-base lg:text-lg font-bold line-clamp-2">
                        {item.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-primary/60 text-xs lg:text-sm">
                          Quantité: {item.quantity}
                        </p>
                        {item.volume && (
                          <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded-full text-xs font-semibold">
                            {item.volume}
                          </span>
                        )}
                      </div>
                      {order.checkoutType === "direct" &&
                        item.originalPrice && (
                          <p className="text-primary/60 text-xs line-through mt-1">
                            Prix original: {formatPrice(item.originalPrice)}
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-secondary font-bold p01 text-sm lg:text-base">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-primary/60 text-xs">
                      {formatPrice(item.price)} × {item.quantity}
                      {item.volume && ` (${item.volume})`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-primary/10 p-4 lg:p-6">
            <h3 className="text-lg font-bold text-primary font-p01 mb-4">
              Informations client
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-primary/60 text-xs font-p01">Nom complet</p>
                <p className="text-primary font-semibold font-p01 text-sm">
                  {order.firstName} {order.lastName}
                </p>
              </div>
              <div>
                <p className="text-primary/60 text-xs font-p01">Email</p>
                <p className="text-primary font-semibold font-p01 text-sm break-all">
                  {order.email}
                </p>
              </div>
              <div>
                <p className="text-primary/60 text-xs font-p01">Téléphone</p>
                <p className="text-primary font-semibold font-p01 text-sm">
                  +213{order.phone}
                </p>
              </div>
              <div>
                <p className="text-primary/60 text-xs font-p01">Date</p>
                <p className="text-primary font-semibold font-p01 text-sm">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {order.checkoutType && (
                <div>
                  <p className="text-primary/60 text-xs font-p01">
                    Type de commande
                  </p>
                  <p className="text-primary font-semibold font-p01 text-sm">
                    {order.checkoutType === "direct"
                      ? "Achat direct"
                      : "Panier"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-primary/10 p-4 lg:p-6">
            <h3 className="text-lg font-bold text-primary font-p01 mb-4">
              Statut
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-primary font-bold01 text-sm">
                  Statut:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold01 ${
                    order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "processing"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status === "completed"
                    ? "Complétée"
                    : order.status === "processing"
                    ? "En traitement"
                    : order.status === "cancelled"
                    ? "Annulée"
                    : "En attente"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-primary/10 p-4 lg:p-6">
            <h3 className="text-lg font-bold text-primary font-p01 mb-4">
              Livraison
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-primary/60 text-xs font-bold01">Adresse</p>
                <p className="text-primary font-semibold font-p01 text-sm">
                  {order.address}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-primary/60 text-xs font-bold01">Wilaya</p>
                  <p className="text-primary font-semibold font-p01 text-sm">
                    {order.willaya}
                  </p>
                </div>

                <div>
                  <p className="text-primary/60 text-xs font-bold01">Commune</p>
                  <p className="text-primary font-semibold font-p01 text-sm">
                    {order.commune}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-primary/60 text-xs font-bold01">Type</p>
                <p className="text-primary font-semibold font-p01 text-sm">
                  {order.deliveryType === "home" ? "🏠 Domicile" : "🏢 Bureau"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-primary/10 p-4 lg:p-6">
            <h3 className="text-lg font-bold text-primary font-p01 mb-4">
              Total
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-primary/60">Sous-total:</span>
                <span className="font-p01">
                  {formatPrice(order.subtotalPrice || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary/60">Livraison:</span>
                <span className="font-p01">
                  {formatPrice(order.shippingPrice || 0)}
                </span>
              </div>
              <div className="border-t border-primary/10 pt-2">
                <div className="flex justify-between text-base font-bold">
                  <span className="text-primary">Total:</span>
                  <span className="text-secondary">
                    {formatPrice(order.totalPrice || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsManager = () => {
  const [activeSettingsTab, setActiveSettingsTab] = useState("admins");

  return (
    <div className="space-y-8">
      <h2 className="text-xl lg:text-2xl font-bold text-primary font-bold01 mb-6">
        Paramètres Administrateur
      </h2>

      <div className="flex border-b border-primary/10 mb-6">
        <button
          className={`px-4 py-2 font-bold01 ${
            activeSettingsTab === "admins"
              ? "border-b-2 border-secondary text-secondary"
              : "text-primary/60"
          }`}
          onClick={() => setActiveSettingsTab("admins")}
        >
          Administrateurs
        </button>
        <button
          className={`px-4 py-2 font-bold01 ${
            activeSettingsTab === "shipping"
              ? "border-b-2 border-secondary text-secondary"
              : "text-primary/60"
          }`}
          onClick={() => setActiveSettingsTab("shipping")}
        >
          Livraison
        </button>
      </div>

      {activeSettingsTab === "admins" && <AdminsSettings />}
      {activeSettingsTab === "shipping" && <ShippingSettings />}
    </div>
  );
};

const AdminsSettings = () => {
  const {
    user,
    updateAdmin,
    createNewAdmin,
    deleteAdmin,
    getAllAdmins,
    adminsList,
    loading: storeLoading,
  } = useAdminStore();

  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showAdminsList, setShowAdminsList] = useState(true);

  const [currentAdminForm, setCurrentAdminForm] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [newAdminForm, setNewAdminForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });

  const isSuperAdmin = user?.role === "super-admin";

  useEffect(() => {
    if (isSuperAdmin) {
      loadAdmins();
    }
  }, [isSuperAdmin]);

  const loadAdmins = async () => {
    try {
      await getAllAdmins();
    } catch (error) {
      console.error("Error loading admins:", error);
    }
  };

  const handleDeleteAdmin = async (adminId, username) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'administrateur "${username}" ?`
      )
    ) {
      return;
    }

    setDeletingId(adminId);
    try {
      await deleteAdmin(adminId);
      await loadAdmins();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const validateUpdateForm = () => {
    const newErrors = {};

    if (!currentAdminForm.currentPassword) {
      newErrors.currentPassword = "Le mot de passe actuel est requis";
    }

    if (
      currentAdminForm.newPassword &&
      currentAdminForm.newPassword.length < 6
    ) {
      newErrors.newPassword =
        "Le nouveau mot de passe doit contenir au moins 6 caractères";
    }

    if (currentAdminForm.newPassword !== currentAdminForm.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    return newErrors;
  };

  const validateNewAdminForm = () => {
    const newErrors = {};

    if (!newAdminForm.username) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (newAdminForm.username.length < 3) {
      newErrors.username =
        "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    if (!newAdminForm.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (newAdminForm.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (newAdminForm.password !== newAdminForm.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    return newErrors;
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();

    const validationErrors = validateUpdateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const updateData = {
        currentPassword: currentAdminForm.currentPassword,
      };

      if (currentAdminForm.newUsername.trim()) {
        updateData.newUsername = currentAdminForm.newUsername;
      }

      if (currentAdminForm.newPassword.trim()) {
        updateData.newPassword = currentAdminForm.newPassword;
      }

      await updateAdmin(updateData);

      setCurrentAdminForm({
        currentPassword: "",
        newUsername: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Compte mis à jour avec succès!");
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAdmin = async (e) => {
    e.preventDefault();

    const validationErrors = validateNewAdminForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setAdminLoading(true);
    setErrors({});

    try {
      await createNewAdmin({
        username: newAdminForm.username,
        password: newAdminForm.password,
        role: isSuperAdmin ? newAdminForm.role : "admin",
      });

      setNewAdminForm({
        username: "",
        password: "",
        confirmPassword: "",
        role: "admin",
      });

      if (isSuperAdmin) {
        await loadAdmins();
      }

      toast.success("Administrateur créé avec succès!");
    } catch (error) {
      console.error("Create admin error:", error);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <>
      <AccessDenied isSuperAdmin={isSuperAdmin} />
      {isSuperAdmin && (
        <>
          {user && (
            <div className="mb-6 p-4 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-secondary text-primary rounded-full flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-primary font-bold01">
                    {user.username}
                  </h3>
                  <p className="text-primary/60 text-sm">
                    Super Administrateur
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-primary/10 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary font-bold01">
                    Gestion des Administrateurs
                  </h3>
                  <p className="text-primary/60 text-sm">
                    {adminsList?.length || 0} administrateur(s) au total
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminsList(!showAdminsList)}
                className="p-2 hover:bg-primary/5 rounded-lg transition-colors"
              >
                <ChevronDown
                  size={20}
                  className={`transform transition-transform ${
                    showAdminsList ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {showAdminsList && (
              <div className="overflow-hidden">
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/10">
                        <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
                          Utilisateur
                        </th>
                        <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
                          Rôle
                        </th>
                        <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
                          Date de création
                        </th>
                        <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminsList?.map((adminItem) => (
                        <tr
                          key={adminItem._id}
                          className="border-b border-primary/5 hover:bg-primary/5 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  adminItem.role === "super-admin"
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {adminItem.role === "super-admin" ? (
                                  <Shield size={14} />
                                ) : (
                                  <User size={14} />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-primary text-sm">
                                  {adminItem.username}
                                  {adminItem._id === user?._id && (
                                    <span className="ml-2 text-xs bg-secondary text-primary px-2 py-0.5 rounded">
                                      Vous
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                adminItem.role === "super-admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {adminItem.role === "super-admin"
                                ? "Super Admin"
                                : "Admin"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-primary text-sm">
                              {new Date(adminItem.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {adminItem._id !== user?._id &&
                                adminItem.role !== "super-admin" && (
                                  <button
                                    onClick={() =>
                                      handleDeleteAdmin(
                                        adminItem._id,
                                        adminItem.username
                                      )
                                    }
                                    disabled={
                                      deletingId === adminItem._id ||
                                      storeLoading
                                    }
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                  >
                                    {deletingId === adminItem._id ? (
                                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Trash2 size={14} />
                                    )}
                                  </button>
                                )}
                              {adminItem._id === user?._id && (
                                <span className="text-xs text-primary/60 italic">
                                  Connecté
                                </span>
                              )}
                              {adminItem.role === "super-admin" &&
                                adminItem._id !== user?._id && (
                                  <span className="text-xs text-primary/60 italic">
                                    Protégé
                                  </span>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden space-y-3">
                  {adminsList?.map((adminItem) => (
                    <div
                      key={adminItem._id}
                      className="bg-primary/5 rounded-lg p-3 border border-primary/10"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              adminItem.role === "super-admin"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {adminItem.role === "super-admin" ? (
                              <Shield size={12} />
                            ) : (
                              <User size={12} />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-primary text-sm">
                              {adminItem.username}
                              {adminItem._id === user?._id && (
                                <span className="ml-1 text-xs bg-secondary text-primary px-1 py-0.5 rounded">
                                  Vous
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            adminItem.role === "super-admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {adminItem.role === "super-admin" ? "Super" : "Admin"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-primary/60">
                          Créé le{" "}
                          {new Date(adminItem.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>

                        <div className="flex items-center gap-2">
                          {adminItem._id !== user?._id &&
                            adminItem.role !== "super-admin" && (
                              <button
                                onClick={() =>
                                  handleDeleteAdmin(
                                    adminItem._id,
                                    adminItem.username
                                  )
                                }
                                disabled={
                                  deletingId === adminItem._id || storeLoading
                                }
                                className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                {deletingId === adminItem._id ? (
                                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                              </button>
                            )}
                          {adminItem._id === user?._id && (
                            <span className="text-xs text-primary/60 italic">
                              Connecté
                            </span>
                          )}
                          {adminItem.role === "super-admin" &&
                            adminItem._id !== user?._id && (
                              <span className="text-xs text-primary/60 italic">
                                Protégé
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(!adminsList || adminsList.length === 0) && (
                  <div className="text-center py-8 text-primary/60">
                    Aucun administrateur trouvé
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white rounded-xl border border-primary/10 p-4 lg:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary font-bold01">
                  Modifier le Compte
                </h3>
              </div>

              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <div>
                  <label className="block text-primary font-bold01 mb-2 text-sm">
                    Mot de passe actuel *
                  </label>
                  <div className="relative">
                    <Key
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/40"
                      size={16}
                    />
                    <input
                      type="password"
                      value={currentAdminForm.currentPassword}
                      onChange={(e) => {
                        setCurrentAdminForm({
                          ...currentAdminForm,
                          currentPassword: e.target.value,
                        });
                        setErrors({ ...errors, currentPassword: "" });
                      }}
                      className={`w-full pl-10 pr-4 py-2 lg:py-3 border rounded-xl focus:outline-none focus:border-secondary text-sm ${
                        errors.currentPassword
                          ? "border-red-500"
                          : "border-primary/20"
                      }`}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                  </div>
                  {errors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-primary font-bold01 mb-2 text-sm">
                    Nouveau nom d'utilisateur (optionnel)
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/40"
                      size={16}
                    />
                    <input
                      type="text"
                      value={currentAdminForm.newUsername}
                      onChange={(e) =>
                        setCurrentAdminForm({
                          ...currentAdminForm,
                          newUsername: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 lg:py-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm"
                      placeholder="Nouveau nom d'utilisateur"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-primary font-bold01 mb-2 text-sm">
                      Nouveau mot de passe (optionnel)
                    </label>
                    <div className="relative">
                      <Key
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/40"
                        size={16}
                      />
                      <input
                        type="password"
                        value={currentAdminForm.newPassword}
                        onChange={(e) => {
                          setCurrentAdminForm({
                            ...currentAdminForm,
                            newPassword: e.target.value,
                          });
                          setErrors({ ...errors, newPassword: "" });
                        }}
                        className={`w-full pl-10 pr-4 py-2 lg:py-3 border rounded-xl focus:outline-none focus:border-secondary text-sm ${
                          errors.newPassword
                            ? "border-red-500"
                            : "border-primary/20"
                        }`}
                        placeholder="Nouveau mot de passe"
                      />
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-primary font-bold01 mb-2 text-sm">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Key
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/40"
                        size={16}
                      />
                      <input
                        type="password"
                        value={currentAdminForm.confirmPassword}
                        onChange={(e) => {
                          setCurrentAdminForm({
                            ...currentAdminForm,
                            confirmPassword: e.target.value,
                          });
                          setErrors({ ...errors, confirmPassword: "" });
                        }}
                        className={`w-full pl-10 pr-4 py-2 lg:py-3 border rounded-xl focus:outline-none focus:border-secondary text-sm ${
                          errors.confirmPassword
                            ? "border-red-500"
                            : "border-primary/20"
                        }`}
                        placeholder="Confirmer le mot de passe"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || storeLoading}
                  className="w-full bg-secondary text-primary py-3 rounded-xl font-bold01 hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm lg:text-base"
                >
                  {loading || storeLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Mise à jour...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Mettre à jour le compte</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-xs">
                  <strong>Note:</strong> Seul le mot de passe actuel (*) est
                  obligatoire. Laissez les autres champs vides si vous ne
                  souhaitez pas les modifier.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-primary/10 p-4 lg:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserPlus size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-primary font-bold01">
                  Ajouter un Administrateur
                </h3>
              </div>

              <form onSubmit={handleAddNewAdmin} className="space-y-4">
                <div>
                  <label className="block text-primary font-bold01 mb-2 text-sm">
                    Nom d'utilisateur *
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/40"
                      size={16}
                    />
                    <input
                      type="text"
                      value={newAdminForm.username}
                      onChange={(e) => {
                        setNewAdminForm({
                          ...newAdminForm,
                          username: e.target.value,
                        });
                        setErrors({ ...errors, username: "" });
                      }}
                      className={`w-full pl-10 pr-4 py-2 lg:py-3 border rounded-xl focus:outline-none focus:border-secondary text-sm ${
                        errors.username ? "border-red-500" : "border-primary/20"
                      }`}
                      placeholder="Nom d'utilisateur"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-primary font-bold01 mb-2 text-sm">
                    Rôle
                  </label>
                  <select
                    value={newAdminForm.role}
                    onChange={(e) =>
                      setNewAdminForm({
                        ...newAdminForm,
                        role: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm"
                  >
                    <option value="admin">Administrateur</option>
                    <option value="super-admin">Super Administrateur</option>
                  </select>
                  <p className="text-primary/60 text-xs mt-1">
                    {newAdminForm.role === "super-admin"
                      ? "Attention: Le super administrateur a tous les privilèges"
                      : "L'administrateur aura des permissions limitées"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-primary font-bold01 mb-2 text-sm">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <Key
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/40"
                        size={16}
                      />
                      <input
                        type="password"
                        value={newAdminForm.password}
                        onChange={(e) => {
                          setNewAdminForm({
                            ...newAdminForm,
                            password: e.target.value,
                          });
                          setErrors({ ...errors, password: "" });
                        }}
                        className={`w-full pl-10 pr-4 py-2 lg:py-3 border rounded-xl focus:outline-none focus:border-secondary text-sm ${
                          errors.password
                            ? "border-red-500"
                            : "border-primary/20"
                        }`}
                        placeholder="Mot de passe"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-primary font-bold01 mb-2 text-sm">
                      Confirmer le mot de passe *
                    </label>
                    <div className="relative">
                      <Key
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/40"
                        size={16}
                      />
                      <input
                        type="password"
                        value={newAdminForm.confirmPassword}
                        onChange={(e) => {
                          setNewAdminForm({
                            ...newAdminForm,
                            confirmPassword: e.target.value,
                          });
                          setErrors({ ...errors, confirmPassword: "" });
                        }}
                        className={`w-full pl-10 pr-4 py-2 lg:py-3 border rounded-xl focus:outline-none focus:border-secondary text-sm ${
                          errors.confirmPassword
                            ? "border-red-500"
                            : "border-primary/20"
                        }`}
                        placeholder="Confirmer le mot de passe"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-xs">
                    <strong>Important:</strong> Le mot de passe doit contenir au
                    moins 6 caractères. Assurez-vous de choisir un mot de passe
                    sécurisé.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading || storeLoading}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-bold01 hover:bg-green-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm lg:text-base"
                >
                  {adminLoading || storeLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Créer un nouvel administrateur</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const ShippingSettings = () => {
  const { shipping, fetchShipping, updateShipping, toggleShipping, loading } =
    useShippingStore();

  const hasFetchedRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchShipping();
      hasFetchedRef.current = true;
    }
  }, [fetchShipping]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredShipping = useMemo(() => {
    if (!searchTerm.trim()) return shipping;
    return shipping.filter(
      (wilaya) =>
        wilaya.wilayaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wilaya.wilayaCode.toString().includes(searchTerm)
    );
  }, [shipping, searchTerm]);

  const handleEditClick = (wilaya) => {
    setEditingId(wilaya._id);
    setEditingData({
      officePrice: wilaya.officePrice,
      homePrice: wilaya.homePrice,
    });
  };

  const handleSave = async (id) => {
    if (!editingData.officePrice || !editingData.homePrice) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      await updateShipping(id, {
        officePrice: Number(editingData.officePrice),
        homePrice: Number(editingData.homePrice),
      });
      setEditingId(null);
      setEditingData({});
      toast.success("Prix mis à jour avec succès!");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  const formatPrice = (price) => {
    return `${price?.toLocaleString("fr-FR") || 0} DA`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-primary text-lg">
              Chargement des données de livraison...
            </p>
          </div>
        </div>
      );
    }

    if (filteredShipping.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-primary/60">Aucune wilaya trouvée</p>
        </div>
      );
    }

    return isMobile ? renderMobileView() : renderDesktopView();
  };

  const renderMobileView = () => (
    <div className="space-y-3 p-4">
      {filteredShipping.map((wilaya) => (
        <WilayaCardMobile
          key={wilaya._id}
          wilaya={wilaya}
          isEditing={editingId === wilaya._id}
          editingData={editingData}
          onEditClick={handleEditClick}
          onSave={handleSave}
          onCancel={handleCancel}
          onEditChange={setEditingData}
          onToggle={toggleShipping}
          formatPrice={formatPrice}
        />
      ))}
    </div>
  );

  const renderDesktopView = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-primary/5 border-b border-primary/10">
            <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
              Code
            </th>
            <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
              Wilaya
            </th>
            <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
              <div className="flex items-center gap-1">
                <Building size={14} />
                <span>Prix Bureau</span>
              </div>
            </th>
            <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
              <div className="flex items-center gap-1">
                <Home size={14} />
                <span>Prix Domicile</span>
              </div>
            </th>
            <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
              Statut
            </th>
            <th className="text-left py-3 px-4 text-primary font-bold01 text-sm">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredShipping.map((wilaya) => (
            <WilayaRowDesktop
              key={wilaya._id}
              wilaya={wilaya}
              isEditing={editingId === wilaya._id}
              editingData={editingData}
              onEditClick={handleEditClick}
              onSave={handleSave}
              onCancel={handleCancel}
              onEditChange={setEditingData}
              onToggle={toggleShipping}
              formatPrice={formatPrice}
            />
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-primary font-bold01">
            Gestion des Prix de Livraison
          </h3>
          <p className="text-primary/60 text-sm">
            Gérez les prix de livraison pour chaque wilaya
          </p>
        </div>

        <div className="relative w-full lg:w-64">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/40"
            size={20}
          />
          <input
            type="text"
            placeholder="Rechercher une wilaya..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 lg:py-3 border border-primary/20 rounded-xl focus:outline-none focus:border-secondary text-sm lg:text-base"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/40 hover:text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
        {renderContent()}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> Vous pouvez activer/désactiver la livraison
          pour chaque wilaya. Une wilaya désactivée ne sera pas disponible lors
          du checkout.
        </p>
      </div>
    </div>
  );
};

const WilayaCardMobile = React.memo(
  ({
    wilaya,
    isEditing,
    editingData,
    onEditClick,
    onSave,
    onCancel,
    onEditChange,
    onToggle,
    formatPrice,
  }) => {
    const [toggling, setToggling] = useState(false);

    const handleToggle = async () => {
      if (toggling) return;
      setToggling(true);
      await onToggle(wilaya._id);
      setToggling(false);
    };

    const handleInputChange = (field, value) => {
      onEditChange({
        ...editingData,
        [field]: value,
      });
    };

    return (
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-primary/60" />
            <div>
              <p className="font-semibold text-primary text-sm">
                {wilaya.wilayaName}
              </p>
              <p className="text-primary/60 text-xs">
                Code: {wilaya.wilayaCode}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              wilaya.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {toggling ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : wilaya.isActive ? (
              <ToggleRight size={10} />
            ) : (
              <ToggleLeft size={10} />
            )}
            <span>{wilaya.isActive ? "Activée" : "Désactivée"}</span>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building size={12} className="text-primary/60" />
              <span className="text-primary/60 text-xs">Prix Bureau:</span>
            </div>
            {isEditing ? (
              <div className="relative w-24">
                <input
                  type="number"
                  min="0"
                  value={editingData.officePrice || ""}
                  onChange={(e) =>
                    handleInputChange("officePrice", e.target.value)
                  }
                  className="w-full p-1 border border-primary/20 rounded text-sm text-right"
                />
                <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-primary/60 text-xs">
                  DA
                </span>
              </div>
            ) : (
              <span className="font-semibold text-primary text-sm">
                {formatPrice(wilaya.officePrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home size={12} className="text-primary/60" />
              <span className="text-primary/60 text-xs">Prix Domicile:</span>
            </div>
            {isEditing ? (
              <div className="relative w-24">
                <input
                  type="number"
                  min="0"
                  value={editingData.homePrice || ""}
                  onChange={(e) =>
                    handleInputChange("homePrice", e.target.value)
                  }
                  className="w-full p-1 border border-primary/20 rounded text-sm text-right"
                />
                <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-primary/60 text-xs">
                  DA
                </span>
              </div>
            ) : (
              <span className="font-semibold text-primary text-sm">
                {formatPrice(wilaya.homePrice)}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => onSave(wilaya._id)}
                  className="p-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Save size={12} />
                </button>
                <button
                  onClick={onCancel}
                  className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <button
                onClick={() => onEditClick(wilaya)}
                className="p-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Edit3 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

WilayaCardMobile.displayName = "WilayaCardMobile";

const WilayaRowDesktop = React.memo(
  ({
    wilaya,
    isEditing,
    editingData,
    onEditClick,
    onSave,
    onCancel,
    onEditChange,
    onToggle,
    formatPrice,
  }) => {
    const [toggling, setToggling] = useState(false);

    const handleToggle = async () => {
      if (toggling) return;
      setToggling(true);
      await onToggle(wilaya._id);
      setToggling(false);
    };

    const handleInputChange = (field, value) => {
      onEditChange({
        ...editingData,
        [field]: value,
      });
    };

    return (
      <tr className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
        <td className="py-3 px-4">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold01">
            {wilaya.wilayaCode}
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-primary/60" />
            <span className="font-semibold text-primary text-sm">
              {wilaya.wilayaName}
            </span>
          </div>
        </td>
        <td className="py-3 px-4">
          {isEditing ? (
            <div className="relative">
              <input
                type="number"
                min="0"
                value={editingData.officePrice || ""}
                onChange={(e) =>
                  handleInputChange("officePrice", e.target.value)
                }
                className="w-full p-2 border border-primary/20 rounded-lg focus:outline-none focus:border-secondary text-sm"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary/60 text-xs">
                DA
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Building size={14} className="text-primary/60" />
              <span className="font-semibold text-primary text-sm">
                {formatPrice(wilaya.officePrice)}
              </span>
            </div>
          )}
        </td>
        <td className="py-3 px-4">
          {isEditing ? (
            <div className="relative">
              <input
                type="number"
                min="0"
                value={editingData.homePrice || ""}
                onChange={(e) => handleInputChange("homePrice", e.target.value)}
                className="w-full p-2 border border-primary/20 rounded-lg focus:outline-none focus:border-secondary text-sm"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary/60 text-xs">
                DA
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Home size={14} className="text-primary/60" />
              <span className="font-semibold text-primary text-sm">
                {formatPrice(wilaya.homePrice)}
              </span>
            </div>
          )}
        </td>
        <td className="py-3 px-4">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold01 transition-colors ${
              wilaya.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {toggling ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : wilaya.isActive ? (
              <ToggleRight size={12} />
            ) : (
              <ToggleLeft size={12} />
            )}
            <span>{wilaya.isActive ? "Activée" : "Désactivée"}</span>
          </button>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => onSave(wilaya._id)}
                  className="p-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Save size={14} />
                </button>
                <button
                  onClick={onCancel}
                  className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => onEditClick(wilaya)}
                className="p-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  }
);

WilayaRowDesktop.displayName = "WilayaRowDesktop";

const AccessDenied = ({ isSuperAdmin }) => {
  if (isSuperAdmin) return null;

  return (
    <div className="text-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
        <Shield className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-lg font-bold text-red-800 mb-2">Accès Refusé</h3>
        <p className="text-red-600 mb-4">
          Vous n'avez pas les permissions nécessaires pour accéder aux
          paramètres.
        </p>
        <p className="text-primary/60 text-sm">
          Seul le super administrateur peut gérer les paramètres.
        </p>
      </div>
    </div>
  );
};

export default Admin;
