"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginSchemaType } from "@/lib/schema";
import useAuth from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
  });
  const { login } = useAuth();

  const handleLogin = async (loginFormData: LoginSchemaType) => {
    login.mutate(loginFormData);
  };

  return (
    <form
      className="flex flex-col gap-y-3"
      onSubmit={handleSubmit(handleLogin)}
    >
      <Label>username</Label>
      <Input
        {...register("username")}
        type="text"
        placeholder="Enter username"
        className={errors.username && "focus-visible:ring-red-500"}
        disabled={login.isPending}
      />
      {errors.username && (
        <p className="text-sm text-red-500">{errors.username.message}</p>
      )}
      <Label>password</Label>
      <div className="relative">
        <Input
          {...register("password")}
          type="password"
          placeholder="Enter password"
          className={errors.password && "focus-visible:ring-red-500"}
          disabled={login.isPending}
        />
      </div>
      {errors.password && (
        <p className="text-sm text-red-500">{errors.password.message}</p>
      )}
      <Link
        className={buttonVariants({
          size: "sm",
          variant: "link",
        })}
        href="/signup"
      >
        Don&apos;t have an account?
      </Link>
      <Button className="mt-4" disabled={login.isPending}>
        {login.isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
};

export default LoginForm;
