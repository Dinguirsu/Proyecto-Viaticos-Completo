import axios from "axios";
import { store } from "../login/State/store";
import { setLogout } from "../login/State/authSlice";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && store.getState().auth.token) {
      toast.error("Sesión expirada. Por favor, inicie sesión nuevamente.", {
        autoClose: 3000,
      });

      setTimeout(() => {
        store.dispatch(setLogout());
        window.location.href = "/login";
      }, 3000); // espera a que se vea el mensaje
    }

    return Promise.reject(error);
  }
);

export default api;
