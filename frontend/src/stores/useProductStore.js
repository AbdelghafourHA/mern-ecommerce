import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../api/axios.js";

export const useProductStore = create((set, get) => ({
  products: [],
  product: null,
  loading: false,
  allProducts: [],

  counts: {
    categories: [],
    gender: "all",
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
  },

  /* --------------------
     FILTERS (GLOBAL)
  ---------------------*/
  filters: {
    category: "all",
    gender: "all",
    maxPrice: null,
    sort: "newest",
    search: "",
  },

  /* --------------------
     ACTIONS
  ---------------------*/
  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, currentPage: 1 },
    }));
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, currentPage: page },
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        category: "all",
        gender: "all",
        maxPrice: null,
        sort: "newest",
        search: "",
      },
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        limit: 12,
      },
    });
  },

  /* --------------------
     FETCH PRODUCTS
  ---------------------*/

  setProducts: (products) => set({ products }),

  getAllProductsForAnalytics: async () => {
    const res = await api.get("/products?limit=10000");
    set({ allProducts: res.data.products });
  },

  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await api.post("/products", productData);
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));
      // toast.success("Product added successfully");
    } catch (error) {
      console.log("error is useProductStore createProduct", error);
      toast.error(error.response.data.error);
      set({ loading: false });
    }
  },

  getAllProducts: async () => {
    const { filters, pagination } = get();

    set({ loading: true });

    try {
      const res = await api.get("/products", {
        params: {
          page: pagination.currentPage,
          limit: pagination.limit,
          search: filters.search || undefined,
          category:
            filters.category && filters.category !== "all"
              ? filters.category
              : undefined,
          gender: filters.gender !== "all" ? filters.gender : undefined,
          maxPrice: filters.maxPrice || undefined,
          sort: filters.sort !== "newest" ? filters.sort : undefined,
        },
      });

      set({
        products: res.data.products,
        counts: res.data.counts,
        pagination: {
          ...pagination,
          ...res.data.pagination,
        },
        loading: false,
      });
    } catch (error) {
      console.error("error in getProducts store", error);
      toast.error("Failed to fetch products");
      set({ loading: false });
    }
  },

  getProductsByCategory: async (category) => {
    const { filters, pagination } = get();
    set({ loading: true });

    try {
      const res = await api.get(`/products/category/${category}`, {
        params: {
          page: pagination.currentPage,
          limit: pagination.limit,
          gender: filters.gender !== "all" ? filters.gender : undefined,
          maxPrice: filters.maxPrice || undefined,
          sort: filters.sort !== "newest" ? filters.sort : undefined,
        },
      });

      set({
        products: res.data.products,
        counts: res.data.counts,
        pagination: {
          ...pagination,
          ...res.data.pagination,
        },
        loading: false,
      });
    } catch (error) {
      console.error("getProductsByCategory store error", error);
      set({ loading: false });
    }
  },

  deleteProduct: async (productId) => {
    const previousProducts = get().products;

    set({
      products: previousProducts.filter((product) => product._id !== productId),
    });

    try {
      await api.delete(`/products/${productId}`);
      toast.success("Produit supprimé avec succès");
    } catch (error) {
      set({ products: previousProducts });

      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  },

  toggleFeatured: async (productId) => {
    set((state) => ({
      products: state.products.map((product) =>
        product._id === productId
          ? { ...product, isFeatured: !product.isFeatured }
          : product
      ),
    }));

    try {
      await api.patch(`/products/${productId}`);
      toast.success("Le produit a été mis à jour avec succès");
    } catch (error) {
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: !product.isFeatured }
            : product
        ),
      }));

      toast.error(error.response?.data?.error || "Failed to update product");
    }
  },

  updateProduct: async (productId, updatedProduct) => {
    set({ loading: true });
    try {
      await api.put(`/products/${productId}`, updatedProduct);
      set((prevState) => ({
        products: prevState.products.map((product) => {
          if (product._id === productId) {
            return { ...product, ...updatedProduct };
          }
          return product;
        }),
        loading: false,
      }));
      toast.success("Le produit a été mis à jour avec succès");
    } catch (error) {
      console.log("error is useProductStore updateProduct", error);
      toast.error(
        error.response.data.error || "Erreur lors de la mise  jour du produit"
      );
      set({ loading: false });
    }
  },

  getFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/products/featured");
      set({ products: res.data, loading: false });
    } catch (error) {
      console.log("error is useProductStore getFeaturedProducts", error);
      toast.error(error.response.data.error || "Failed to fetch products");
      set({ loading: false });
    }
  },

  getProductById: async (productId) => {
    set({ loading: true, product: null });
    try {
      const res = await api.get(`/products/${productId}`);
      set({ product: res.data, loading: false });
    } catch (error) {
      console.log("error is useProductStore getProductById", error);
      toast.error(error.response.data.error || "Failed to fetch products");
      set({ loading: false });
    }
  },

  productDiscount: async (productId, discount) => {
    try {
      const response = await api.put(`/products/${productId}/discount`, {
        discount,
      });

      const updatedProduct = response.data;

      set((state) => ({
        products: state.products.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        ),
      }));

      toast.success("Discount mis à jour avec succès!");
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product discount:", error);
      toast.error("Erreur lors de la mise à jour du discount");
      throw error;
    }
  },

  updateProductPricing: async (productId, price, discount) => {
    try {
      const response = await api.put(`/products/${productId}/pricing`, {
        price,
        discount,
      });

      const updatedProduct = response.data;

      set((state) => ({
        products: state.products.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        ),
      }));

      toast.success("Prix mis à jour avec succès!");
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product pricing:", error);
      toast.error("Erreur lors de la mise à jour du prix");
      throw error;
    }
  },

  calculateDiscountedPrice: (price, discount) => {
    if (!discount || discount <= 0) return price;
    return Math.round(price * (1 - discount / 100));
  },

  applyDiscountToAll: async (discount, categories = []) => {
    try {
      const response = await api.put("/products/discount/all", {
        discount,
        categories,
      });

      const result = response.data;

      set((state) => ({
        products: state.products.map((product) => {
          const updatedProduct = result.products.find(
            (p) => p._id === product._id
          );
          return updatedProduct ? updatedProduct : product;
        }),
      }));

      return result;
    } catch (error) {
      console.error("Error applying discount to all products:", error);
      throw error;
    }
  },

  removeDiscountFromAll: async (categories = []) => {
    try {
      const response = await api.delete("/products/discount/all", {
        data: { categories },
      });

      const result = response.data;

      set((state) => ({
        products: state.products.map((product) => {
          const updatedProduct = result.products.find(
            (p) => p._id === product._id
          );
          return updatedProduct ? updatedProduct : product;
        }),
      }));

      return result;
    } catch (error) {
      console.error("Error removing discount from all products:", error);
      throw error;
    }
  },
}));
