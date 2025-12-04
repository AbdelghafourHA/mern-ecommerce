import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../api/axios.js";

export const useProductStore = create((set, get) => ({
  products: [],
  product: null,
  loading: false,

  setProducts: (products) => set({ products }),

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
    set({ loading: true });
    try {
      const res = await api.get("/products");
      set({ products: res.data, loading: false });
    } catch (error) {
      console.log("error is useProductStore getAllProducts", error);
      toast.error(error.response.data.error || "Failed to fetch products");
      set({ loading: false });
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await api.delete(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.filter(
          (product) => product._id !== productId
        ),
        loading: false,
      }));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.log("error is useProductStore deleteProduct", error);
      toast.error(error.response.data.error || "Failed to delete product");
      set({ loading: false });
    }
  },

  toggleFeatured: async (productId) => {
    set({ loading: true });

    try {
      await api.patch(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.map((product) => {
          if (product._id === productId) {
            return { ...product, isFeatured: !product.isFeatured };
          }
          return product;
        }),
        loading: false,
      }));
      toast.success("Le produit a été mis à jour avec succès");
    } catch (error) {
      console.log("error is useProductStore toggleFeatured", error);
      toast.error(error.response.data.error || "Failed to update product");
      set({ loading: false });
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

  getProductByCategory: async (category) => {
    set({ loading: true });
    try {
      const res = await api.get(`/products/category/${category}`);
      set({ products: res.data, loading: false });
    } catch (error) {
      console.log("error is useProductStore getProductByCategory", error);
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

  // دالة لتحديث التخفيض فقط
  productDiscount: async (productId, discount) => {
    try {
      const response = await api.put(`/products/${productId}/discount`, {
        discount,
      });

      const updatedProduct = response.data;

      // تحديث state بإضافة المنتج المحدث
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

  // دالة لتحديث السعر والتخفيض معاً
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

  // دالة لحساب السعر بعد التخفيض (للاستخدام في الواجهة)
  calculateDiscountedPrice: (price, discount) => {
    if (!discount || discount <= 0) return price;
    return Math.round(price * (1 - discount / 100));
  },

  // تطبيق التخفيض على جميع المنتجات
  applyDiscountToAll: async (discount, categories = []) => {
    try {
      const response = await api.put("/products/discount/all", {
        discount,
        categories,
      });

      const result = response.data;

      // تحديث state بالمنتجات المحدثة
      set((state) => ({
        products: state.products.map((product) => {
          const updatedProduct = result.products.find(
            (p) => p._id === product._id
          );
          return updatedProduct ? updatedProduct : product;
        }),
      }));

      // toast.success(`Discount de ${discount}% appliqué avec succès!`);
      return result;
    } catch (error) {
      console.error("Error applying discount to all products:", error);
      // toast.error("Erreur lors de l'application du discount");
      throw error;
    }
  },

  removeDiscountFromAll: async (categories = []) => {
    try {
      const response = await api.delete("/products/discount/all", {
        data: { categories },
      });

      const result = response.data;

      // تحديث state بالمنتجات المحدثة
      set((state) => ({
        products: state.products.map((product) => {
          const updatedProduct = result.products.find(
            (p) => p._id === product._id
          );
          return updatedProduct ? updatedProduct : product;
        }),
      }));

      // toast.success("Tous les discounts ont été supprimés avec succès!");
      return result;
    } catch (error) {
      console.error("Error removing discount from all products:", error);
      // toast.error("Erreur lors de la suppression des discounts");
      throw error;
    }
  },
}));
