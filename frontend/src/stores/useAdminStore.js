import { create } from "zustand";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useAdminStore = create((set, get) => ({
  user: null, // Main user state
  adminsList: [], // Store admins list
  loading: false,
  checkingAuth: true,
  login: async (username, password) => {
    set({ loading: true });
    try {
      const response = await api.post("/auth/login", { username, password });
      set({ user: response.data, loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur de connexion !!");
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      set({ user: null, adminsList: [] });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "èchec de logout!!" //in french
      );
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true, user: null });
    try {
      const response = await api.get("/auth/profile");
      set({ user: response.data, checkingAuth: false });
    } catch (error) {
      console.log("error is useAdminStore checkAuth", error);
      set({ checkingAuth: false, user: null });
    }
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await api.post("/auth/refresh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },

  createNewAdmin: async (adminData) => {
    set({ loading: true });
    try {
      const response = await api.post("/auth/create", adminData);
      // toast.success("Administrateur créé avec succès");
      set({ loading: false });
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "La création de l'administrateur a échoué. Veuillez réessayer."
      );
      set({ loading: false });
      throw error;
    }
  },

  getAllAdmins: async () => {
    set({ loading: true });
    try {
      const response = await api.get("/auth/admins");
      set({ adminsList: response.data.admins, loading: false });
      return response.data.admins;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement des administrateurs"
      );
      set({ loading: false });
      throw error;
    }
  },

  deleteAdmin: async (adminId) => {
    set({ loading: true });
    try {
      const response = await api.delete(`/auth/delete/${adminId}`);

      // Update local state
      set((state) => ({
        adminsList: state.adminsList.filter((admin) => admin._id !== adminId),
        loading: false,
      }));

      toast.success(
        response.data.message || "Administrateur supprimé avec succès"
      );
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la suppression de l'administrateur"
      );
      set({ loading: false });
      throw error;
    }
  },

  getAdminProfile: async () => {
    set({ loading: true });
    try {
      const response = await api.get("/auth/profile");
      set({
        user: response.data,
        loading: false,
      });
      return response.data;
    } catch (error) {
      console.log("Get profile error:", error);
      set({ loading: false });
      throw error;
    }
  },

  isSuperAdmin: () => {
    const user = get().user;
    return user?.role === "super-admin";
  },

  updateAdmin: async (adminData) => {
    set({ loading: true });
    try {
      const response = await api.put("/auth/update", adminData);

      // Refresh user profile
      const profileResponse = await api.get("/auth/profile");

      set({
        user: profileResponse.data,
        loading: false,
      });

      // toast.success(
      //   response.data.message || "Mise à jour de l'administrateur réussie"
      // );
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "La mise à jour de l'administrateur a échoué. Veuillez réessayer."
      );
      set({ loading: false });
      throw error;
    }
  },
}));

// axios interceptor for token refresh
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (refreshPromise) {
          await refreshPromise;
          return api(originalRequest);
        }

        refreshPromise = useAdminStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return api(originalRequest);
      } catch (refreshError) {
        useAdminStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
