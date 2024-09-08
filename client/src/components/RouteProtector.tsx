"use client";

import useAuth, { REFRESH_THRESHOLD } from "@/hooks/useAuth";
import { isRefreshTokenExpired } from "@/utils/refreshAccessToken";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect } from "react";

type RouteGuardProps = {
  children: React.ReactNode;
  authRequired: boolean;
};

const RouteProtector = ({ children, authRequired }: RouteGuardProps) => {
  const { getAuthUser, logout } = useAuth();
  const { data: authUser, isLoading } = getAuthUser;
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (authRequired && !authUser) {
        router.push("/login");
      } else if (!authRequired && authUser) {
        router.push("/dashboard");
      }
    }
  }, [authUser, isLoading, authRequired, router]);

  useEffect(() => {
    const checkRefreshToken = async () => {
      if (authUser && authRequired) {
        const isExpired = await isRefreshTokenExpired();
        if (isExpired) logout.mutate();
      }
    };

    const intervalId = setInterval(checkRefreshToken, REFRESH_THRESHOLD);

    return () => clearInterval(intervalId);
  }, [authUser, isRefreshTokenExpired]);

  if (isLoading) {
    return (
      <div className="mx-auto min-h-screen max-w-8xl flex items-center justify-center">
        <LoaderCircle className="size-10 animate-spin text-purple-400" />
      </div>
    );
  }

  if ((authRequired && authUser) || (!authRequired && !authUser)) {
    return <Fragment>{children}</Fragment>;
  }

  return null;
};

export default RouteProtector;
