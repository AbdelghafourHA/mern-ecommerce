import toast from "react-hot-toast";
import api from "../api/axios";
import { create } from "zustand";

export const useCheckoutStore = create((set, get) => ({
  checkout: null,
  checkouts: [],
  loading: false,

  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCheckouts: 0,
    limit: 10,
  },

  /* ===============================
     ACTIONS
  ================================*/

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, currentPage: page },
    }));
  },

  /* ===============================
     FETCH CHECKOUTS (PAGINATED)
  ================================*/
  getAllCheckouts: async () => {
    const { pagination } = get();
    set({ loading: true });

    try {
      const res = await api.get("/checkout", {
        params: {
          page: pagination.currentPage,
          limit: pagination.limit,
        },
      });

      set({
        checkouts: res.data.checkouts,
        pagination: {
          ...pagination,
          ...res.data.pagination,
        },
        loading: false,
      });
    } catch (error) {
      console.error("getAllCheckouts store error", error);
      toast.error("Échec de la récupération des checkouts");
      set({ loading: false });
    }
  },

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

  updateCheckoutStatus: async (checkoutId, status) => {
    try {
      const res = await api.put(`/checkout/${checkoutId}`, { status });

      const updatedCheckout = res.data;

      set((state) => ({
        checkouts: state.checkouts.map((checkout) =>
          checkout._id === checkoutId
            ? { ...checkout, status: updatedCheckout.status }
            : checkout
        ),
      }));
    } catch (error) {
      console.log("erreur dans useCheckoutStore updateCheckoutStatus", error);
      toast.error(
        error.response?.data?.error ||
          "Échec de la mise à jour du statut du checkout"
      );
    }
  },
  updateCheckoutStatus: async (checkoutId, status) => {
    try {
      const res = await api.put(`/checkout/${checkoutId}`, { status });

      const updatedCheckout = res.data;

      set((state) => ({
        checkouts: state.checkouts.map((checkout) =>
          checkout._id === checkoutId
            ? { ...checkout, status: updatedCheckout.status }
            : checkout
        ),
      }));
    } catch (error) {
      console.log("erreur dans useCheckoutStore updateCheckoutStatus", error);
      toast.error(
        error.response?.data?.error ||
          "Échec de la mise à jour du statut du checkout"
      );
    }
  },

  deleteCheckout: async (id) => {
    try {
      await api.delete(`/checkout/${id}`);

      set((state) => ({
        checkouts: state.checkouts.filter((checkout) => checkout._id !== id),
        pagination: {
          ...state.pagination,
          totalCheckouts: state.pagination.totalCheckouts - 1,
          totalPages: Math.max(
            1,
            Math.ceil(
              (state.pagination.totalCheckouts - 1) / state.pagination.limit
            )
          ),
          currentPage:
            state.checkouts.length === 1 && state.pagination.currentPage > 1
              ? state.pagination.currentPage - 1
              : state.pagination.currentPage,
        },
      }));

      toast.success("Checkout supprimé avec succès");
    } catch (error) {
      console.log("erreur dans useCheckoutStore deleteCheckout", error);
      toast.error(
        error.response?.data?.error || "Échec de la suppression du checkout"
      );
    }
  },
}));
