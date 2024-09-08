import { REFRESH_THRESHOLD } from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";

export const refreshAccessToken = async (): Promise<string | null> => {
  const res = await fetch("/api/auth/refresh", {
    credentials: "include",
  });

  if (!res.ok) return null;

  const data = await res.json();

  return data.accessToken;
};

export const isAccessTokenExpired = (token: string) => {
  const decoded = jwtDecode(token);
  if (!decoded || typeof decoded.exp !== "number") return token;

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();

  if (expirationTime - currentTime < REFRESH_THRESHOLD) return true;

  return false;
};

export const isRefreshTokenExpired = async (): Promise<boolean> => {
  const res = await fetch("/api/auth/refresh", {
    credentials: "include",
  });

  const data = await res.json();

  if (data.error === "No Refresh Token") return true;

  return false;
};
