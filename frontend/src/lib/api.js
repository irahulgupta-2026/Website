import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Admin token stored in localStorage
export const setAdminToken = (t) => {
  if (t) localStorage.setItem("admin_token", t);
  else localStorage.removeItem("admin_token");
};
export const getAdminToken = () => localStorage.getItem("admin_token");

export const adminApi = axios.create({
  baseURL: API,
  withCredentials: true,
});
adminApi.interceptors.request.use((cfg) => {
  const t = getAdminToken();
  if (t) cfg.headers["X-Admin-Token"] = t;
  return cfg;
});

export const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
