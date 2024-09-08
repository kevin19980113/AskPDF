"use client";

import { useToken } from "@/hooks/useToken";
import { subscriptionPlanType } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import MaxWidthWrapper from "./MaxWidthWrapper";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useState } from "react";

const BillingForm = () => {
  const { accessToken } = useToken();
  const { data: subscriptionPlan, isLoading } = useQuery({
    queryKey: ["subscriptionPlan"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/checkout/get-user-subscription-plan", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok)
          throw new Error(
            data.message || "An error occurred Please try again."
          );

        return data as subscriptionPlanType;
      } catch (error: any) {
        toast.error(error.message);
      }
    },
  });
  const [isCheckingout, setIsCheckingout] = useState(false);

  const { mutate: checkout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/checkout/create-session", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();

        if (!res.ok)
          throw new Error(
            data.error || "An error occurred Please try again later."
          );

        window.location.href = data.url;
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    onMutate: () => setIsCheckingout(true),
    onSettled: () => setIsCheckingout(false),
  });

  if (isLoading)
    return (
      <div className="w-full min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Loader2 className="size-10 animate-spin text-purple-400" />
      </div>
    );

  return (
    <MaxWidthWrapper className="max-w-3xl">
      <form
        className="mt-12"
        onSubmit={(e) => {
          e.preventDefault();
          checkout();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the{" "}
              <strong>
                {subscriptionPlan?.name ? subscriptionPlan.name : "Free"}
              </strong>{" "}
              plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button type="submit" disabled={isCheckingout}>
              {isCheckingout ? (
                <Loader2 className="mr-4 size-4 animate-spin" />
              ) : null}
              {subscriptionPlan && subscriptionPlan.isSubscribed
                ? "Manage Subscription"
                : "Upgrade to PRO"}
            </Button>

            {subscriptionPlan && subscriptionPlan.isSubscribed ? (
              <p className="rounded-full text-xs font-medium">
                {subscriptionPlan.isCanceled
                  ? "Your plan will be canceled on "
                  : "Your plan renews on "}
                <strong>
                  {format(
                    subscriptionPlan.stripeCurrentPeriodEnd!,
                    "MMM.do.yyyy"
                  )}
                </strong>
                .
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  );
};

export default BillingForm;
