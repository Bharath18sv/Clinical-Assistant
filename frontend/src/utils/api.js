import axios from "axios";
import { isTokenExpired } from "./src/utils/auth";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URI,
});
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (isTokenExpired(token)) {
        // Token is expired, handle accordingly (e.g., refresh token or redirect to login)
        localStorage.removeItem("token");
        // Optionally, you can redirect the user to the login page
        window.location.href = "/signin";
        return Promise.reject("Token expired");
      } else {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
