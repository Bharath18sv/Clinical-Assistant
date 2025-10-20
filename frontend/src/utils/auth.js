import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTimeSeconds = Math.floor(Date.now() / 1000);
    if (typeof decoded?.exp !== "number") return true;
    return decoded.exp <= currentTimeSeconds;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};
