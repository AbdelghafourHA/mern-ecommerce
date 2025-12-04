import toast from "react-hot-toast";
import api from "../api/axios";
import { create } from "zustand";

export const useCheckoutStore = create((set, get) => ({
  checkout: null,
  checkouts: [],
  loading: false,

  createCheckout: async (checkoutData) => {
    set({ loading: true });
    try {
      const res = await api.post("/checkout", checkoutData);
      set({ checkout: res.data, loading: false });
      toast.success("Checkout créé avec succès");
    } catch (error) {
      console.log("erreur dans useCheckoutStore createCheckout", error);
      toast.error(
        error.response.data.error || "Échec de la création du checkout"
      );
      set({ loading: false });
    }
  },

  getAllCheckouts: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/checkout");
      set({ checkouts: res.data, loading: false });
    } catch (error) {
      console.log("erreur dans useCheckoutStore getAllCheckouts", error);
      toast.error(
        error.response.data.error || "Échec de la récupération des checkouts"
      );
      set({ loading: false });
    }
  },

  updateCheckoutStatus: async (checkoutId, status) => {
    set({ loading: true });
    try {
      const res = await api.put(`/checkout/${checkoutId}`, { status });
      set({ checkout: res.data, loading: false });
      // toast.success("Statut du checkout mis à jour avec succès");
    } catch (error) {
      console.log("erreur dans useCheckoutStore updateCheckoutStatus", error);
      toast.error(
        error.response.data.error ||
          "Échec de la mise à jour du statut du checkout"
      );
      set({ loading: false });
    }
  },

  deleteCheckout: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/checkout/${id}`);
      set({
        checkouts: get().checkouts.filter((checkout) => checkout._id !== id),
        loading: false,
      });
      toast.success("Checkout supprimé avec succès");
    } catch (error) {
      console.log("erreur dans useCheckoutStore deleteCheckout", error);
      toast.error(
        error.response.data.error || "Échec de la suppression du checkout"
      );
      set({ loading: false });
    }
  },
}));
