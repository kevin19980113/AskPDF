"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema, SignupSchemaType } from "@/lib/schema";
import useAuth from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import PasswordRegexPopover from "./PasswordRegexPopover";

const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(SignupSchema),
  });
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async (signupFormData: SignupSchemaType) => {
    signup.mutate(signupFormData, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <form
      className="flex flex-col gap-y-3"
      onSubmit={handleSubmit(handleSignup)}
    >
      <Label>username</Label>
      <Input
        {...register("username")}
        type="text"
        placeholder="Enter username"
        className={errors.username && "focus-visible:ring-red-500"}
        disabled={signup.isPending}
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
          onFocus={() => setIsPopoverVisible(true)}
          onBlur={() => setIsPopoverVisible(false)}
          disabled={signup.isPending}
        />
        {isPopoverVisible && (
          <PasswordRegexPopover password={watch("password")} />
        )}
      </div>
      {errors.password && (
        <p className="text-sm text-red-500">{errors.password.message}</p>
      )}
      <Label>confirm password</Label>
      <Input
        {...register("confirmPassword")}
        type="password"
        placeholder="Confirm your password"
        className={errors.confirmPassword && "focus-visible:ring-red-500"}
        disabled={signup.isPending}
      />
      {errors.confirmPassword && (
        <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
      )}
      <Link
        className={buttonVariants({
          size: "sm",
          variant: "link",
        })}
        href="/login"
      >
        Already have account?
      </Link>
      <Button className="mt-4" disabled={signup.isPending}>
        {signup.isPending ? "Creating accout..." : "Create account"}
      </Button>
    </form>
  );
};

export default SignupForm;
