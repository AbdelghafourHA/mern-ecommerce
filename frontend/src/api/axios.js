import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.mode === "development" ? "http://localhost:5000/api" : "/api",
  withCredentials: true,
});

api.defaults.timeout = 60000;

export default api;
