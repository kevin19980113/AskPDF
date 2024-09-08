import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToken } from "./useToken";
import { useCallback } from "react";
import {
  isAccessTokenExpired,
  refreshAccessToken,
} from "../utils/refreshAccessToken";
import { LoginSchemaType, SignupSchemaType } from "@/lib/schema";
import { toast } from "sonner";

export const REFRESH_THRESHOLD = 5 * 60 * 1000;

type LoginMutationResultType = { username: string; accessToken: string };

const useAuth = () => {
  const { accessToken, setAccessToken } = useToken();
  const queryClient = useQueryClient();

  const setAccessTokenAsync = useCallback(
    (token: string | null): Promise<void> => {
      return new Promise((resolve) => {
        setAccessToken(token);
        setTimeout(() => resolve(), 0);
      });
    },
    [setAccessToken]
  );

  const getAuthUser = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      let latestAccessToken = accessToken;

      if (!latestAccessToken) {
        latestAccessToken = await refreshAccessToken();

        if (!latestAccessToken) return null;

        await setAccessTokenAsync(latestAccessToken);
      } else if (isAccessTokenExpired(latestAccessToken)) {
        latestAccessToken = await refreshAccessToken();

        if (!latestAccessToken) return null;
        await setAccessTokenAsync(latestAccessToken);
      }

      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${latestAccessToken}`,
        },
      });
      if (!res.ok) return null;

      const data = await res.json();

      return data;
    },
    refetchInterval: REFRESH_THRESHOLD,
    staleTime: REFRESH_THRESHOLD,
    retry: false,
  });

  const login = useMutation({
    mutationFn: async ({ username, password }: LoginSchemaType) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok)
        throw new Error(
          data.error || "Failed to login. Please try again later."
        ) as Error;

      return data;
    },
    onSuccess: async (data: LoginMutationResultType) => {
      await setAccessTokenAsync(data.accessToken);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success(`welcome, ${data.username}!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.status === 204) return null;

      if (!res.ok)
        throw new Error("Failed to logout Pleas try again.") as Error;

      const data = await res.json();

      return data;
    },
    onSuccess: async (data: { username: string } | null) => {
      await setAccessTokenAsync(null);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      if (data) return toast.success(`Goodbye, ${data.username}!`);

      toast.info("Your session has been expired. Please login again.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const signup = useMutation({
    mutationFn: async ({
      username,
      password,
      confirmPassword,
    }: SignupSchemaType) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          confirmPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok)
        throw new Error(
          data.error || "Failed to sign up. Please try again later."
        ) as Error;
    },
    onSuccess: () => {
      toast.success("Signup Successful!! Please Login.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { getAuthUser, login, logout, signup };
};

export default useAuth;
