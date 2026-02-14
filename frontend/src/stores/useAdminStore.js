import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useAdminStore = create(
  persist(
    (set, get) => ({
      user: null,
      adminsList: [],
      loading: false,
      checkingAuth: true,
      accessToken: null,
      refreshTokenValue: null,

      login: async (username, password) => {
        set({ loading: true });
        try {
          const res = await api.post("/auth/login", { username, password });

          localStorage.setItem("accessToken", res.data.accessToken);
          localStorage.setItem("refreshToken", res.data.refreshToken);

          set({
            user: res.data.admin,
            accessToken: res.data.accessToken,
            refreshTokenValue: res.data.refreshToken,
            loading: false,
          });

          toast.success("Connexion réussie");
        } catch (err) {
          toast.error("Erreur de connexion");
          set({ loading: false });
        }
      },

      logout: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          await api.post("/auth/logout", { refreshToken });
        }

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        set({
          user: null,
          accessToken: null,
          refreshTokenValue: null,
        });
      },

      checkAuth: async () => {
        set({ checkingAuth: true });
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          set({ checkingAuth: false, user: null });
          return;
        }

        try {
          const response = await api.get("/auth/profile");
          set({
            user: response.data,
            checkingAuth: false,
            accessToken: accessToken,
          });
        } catch (error) {
          if (error.response?.status === 401) {
            await get().refreshAccessToken();
          } else {
            set({ checkingAuth: false, user: null });
          }
        }
      },

      refreshAccessToken: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          set({ user: null, accessToken: null });
          return;
        }

        try {
          const res = await api.post("/auth/refresh-token", {
            refreshToken,
          });

          localStorage.setItem("accessToken", res.data.accessToken);
          set({ accessToken: res.data.accessToken });

          await get().checkAuth();
        } catch (error) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({ user: null, accessToken: null, refreshTokenValue: null });
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
            adminsList: state.adminsList.filter(
              (admin) => admin._id !== adminId
            ),
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
    }),
    {
      name: "admin-storage", // اسم التخزين
      storage: createJSONStorage(() => localStorage), // استخدام localStorage
      partialize: (state) => ({
        // حفظ فقط هذه الحقول في localStorage
        user: state.user,
        refreshTokenValue: state.refreshTokenValue,
      }),
    }
  )
);

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") || useAdminStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const res = await api.post("/auth/refresh-token", { refreshToken });
        localStorage.setItem("accessToken", res.data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        useAdminStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);
