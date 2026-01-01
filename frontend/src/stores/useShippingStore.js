import { create } from "zustand";
import api from "../api/axios";

export const useShippingStore = create((set, get) => ({
  shipping: [],
  loading: false,
  error: null,

  fetchShipping: async () => {
    if (get().shipping.length > 0) return;
    try {
      set({ loading: true });
      const res = await api.get("/shipping");
      set({ shipping: res.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createShipping: async (data) => {
    try {
      const res = await api.post("/shipping", data);
      set((state) => ({
        shipping: [...state.shipping, res.data],
      }));
    } catch (error) {
      throw error;
    }
  },

  updateShipping: async (id, data) => {
    try {
      const res = await api.put(`/shipping/${id}`, data);
      set((state) => ({
        shipping: state.shipping.map((s) => (s._id === id ? res.data : s)),
      }));
    } catch (error) {
      throw error;
    }
  },

  toggleShipping: async (id) => {
    try {
      const res = await api.patch(`/shipping/${id}/toggle`);
      set((state) => ({
        shipping: state.shipping.map((s) => (s._id === id ? res.data : s)),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
