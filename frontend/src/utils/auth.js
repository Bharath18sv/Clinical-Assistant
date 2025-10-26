import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    // console.log("decoded jwt token:", decoded);
    const currentTimeSeconds = Math.floor(Date.now() / 1000);
    if (typeof decoded?.exp !== "number") {
      console.log("token expired");
      return true;
    }
    return decoded.exp <= currentTimeSeconds;
  } catch (error) {
    console.log("token expired");
    console.error("Error decoding token:", error);
    return true;
  }
};
