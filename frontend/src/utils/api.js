import axios from "axios";
import { isTokenExpired } from "@/utils/auth";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // if you’re also using cookies
});

API.interceptors.request.use(
  (req) => {
    // 🔹 Add Authorization header if token exists and valid
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.accessToken;
    if (token) {
      if (isTokenExpired(token)) {
        // Token expired → clear storage + redirect
        localStorage.removeItem("user");
        window.location.href = "/signin";
        return Promise.reject("Token expired");
      } else {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }

    // 🔹 Detect if request contains a file → switch to multipart/form-data
    if (req.data) {
      const hasFile = Object.values(req.data).some(
        (value) =>
          value instanceof File ||
          value instanceof Blob ||
          (Array.isArray(value) && value.some((item) => item instanceof File))
      );

      if (hasFile) {
        const formData = new FormData();

        Object.entries(req.data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
          } else {
            formData.append(key, value);
          }
        });

        req.data = formData;
        req.headers["Content-Type"] = "multipart/form-data";
      }
    }

    return req;
  },
  (error) => Promise.reject(error)
);

export default API;
