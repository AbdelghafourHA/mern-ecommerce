import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../api/axios";

export const useAnalyticStore = create((set, get) => ({
  loading: false,
  productsAnalytics: null,
  analyticsStats: null,
  error: null,

  getAllAnalytics: async (force = false) => {
    const { analyticsStats } = get();

    if (analyticsStats && !force) {
      console.log("Using cached analytics data");
      return true;
    }

    set({
      loading: true,
      error: null,
    });

    try {
      const [productsRes, checkoutsRes] = await Promise.all([
        api.get("/analytics/products"),
        api.get("/analytics/checkouts"),
      ]);

      if (!productsRes.data.success || !checkoutsRes.data.success) {
        throw new Error("Server response error");
      }

      set({
        productsAnalytics: productsRes.data,
        analyticsStats: checkoutsRes.data.stats || {},
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error("Error fetching analytics:", error);

      let errorMessage = "Failed to load analytics";
      if (error.response) {
        errorMessage = error.response.data?.message || "Server error";
      } else if (error.request) {
        errorMessage = "No connection to server";
      } else {
        errorMessage = error.message;
      }

      set({
        loading: false,
        error: errorMessage,
      });

      toast.error(errorMessage);
      return false;
    }
  },

  getProductsAnalytics: async () => {
    set({ loading: true, error: null });

    try {
      const res = await api.get("/analytics/products");

      if (!res.data.success) {
        throw new Error(res.data.message || "Invalid response");
      }

      set({
        productsAnalytics: res.data,
        loading: false,
        error: null,
      });

      return res.data;
    } catch (error) {
      console.error("Error fetching product analytics:", error);

      set({
        loading: false,
        error: error.message,
      });

      toast.error("Failed to load product analytics");
      throw error;
    }
  },

  getCheckoutsAnalytics: async () => {
    set({ loading: true, error: null });

    try {
      const res = await api.get("/analytics/checkouts");

      if (!res.data.success) {
        throw new Error(res.data.message || "Invalid response");
      }

      set({
        analyticsStats: res.data.stats || {},
        loading: false,
        error: null,
      });

      return res.data;
    } catch (error) {
      console.error("Error fetching checkout analytics:", error);

      set({
        loading: false,
        error: error.message,
      });

      toast.error("Failed to load checkout analytics");
      throw error;
    }
  },

  resetAnalytics: () => {
    set({
      productsAnalytics: null,
      analyticsStats: null,
      loading: false,
      error: null,
    });
  },
}));
