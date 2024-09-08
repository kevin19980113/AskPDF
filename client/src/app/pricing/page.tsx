"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import UpgradeButton from "@/components/UpgradeButton";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useAuth from "@/hooks/useAuth";
import { PLANS, pricingItems } from "@/utils/price";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, HelpCircle, Loader2, Minus } from "lucide-react";
import Link from "next/link";

const PricingPage = () => {
  const { getAuthUser } = useAuth();
  const { data: user, isLoading } = getAuthUser;

  if (isLoading)
    return (
      <div className="w-full min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Loader2 className="size-12 animate-spin text-purple-400" />
      </div>
    );
  return (
    <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
      <div className="mx-auto mb-10 md:max-w-2xl">
        <h1 className="text-5xl font-bold sm:text-6xl">Pricing</h1>
        <p className="mt-5 text-gray-600 sm:text-lg">
          Whether you&apos;re just trying out our service or need more,
          we&apos;ve got you covered.
        </p>
      </div>

      <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <TooltipProvider>
          {pricingItems.map(({ plan, tagline, quota, features }) => {
            const price = PLANS.find(
              (p) => p.slug === plan.toLocaleLowerCase()
            )?.price;

            return (
              <div
                key={plan}
                className={cn("relative rounded-2xl bg-white shadow-lg", {
                  "border-2 border-purple-600 shadow-blue-200": plan === "Pro",
                  "border border-gray-200": plan === "Free",
                })}
              >
                {plan === "Pro" && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
                    Upgrade now
                  </div>
                )}

                <div className="p-5">
                  <h3 className="my-3 text-center text-3xl font-bold">
                    {plan}
                  </h3>
                  <p className="text-gray-500">{tagline}</p>
                  <p className="my-5 text-5xl font-semibold">${price}</p>
                  <p className="text-gray-500">per month</p>
                </div>

                <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-1">
                    <p>{quota.toLocaleString()} PDFs/mo included</p>

                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="cursor-default ml-1.5">
                        <HelpCircle className="size-4 text-zinc-500" />
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-2">
                        How many PDFs you can upload per month.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <ul className="my-10 space-y-5 px-8">
                  {features.map(({ text, footnote, negative }) => (
                    <li key={text} className="flex space-x-5">
                      <div className="flex-shrink-0">
                        {negative ? (
                          <Minus className="size-6 text-gray-300" />
                        ) : (
                          <Check className="size-6 text-purple-500" />
                        )}
                      </div>
                      {footnote ? (
                        <div className="flex items-center space-x-1">
                          <p
                            className={cn("text-gray-800", {
                              "text-gray-400": negative,
                            })}
                          >
                            {text}
                          </p>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger className="cursor-default ml-1.5">
                              <HelpCircle className="size-4 text-zinc-500" />
                            </TooltipTrigger>
                            <TooltipContent className="w-80 p-2">
                              {footnote}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <p
                          className={cn("text-gray-800", {
                            "text-gray-400": negative,
                          })}
                        >
                          {text}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-200" />
                <div className="p-5">
                  {plan === "Free" ? (
                    <Link
                      href={user ? "/dashboard" : "/login"}
                      className={buttonVariants({
                        className: "w-full",
                        variant: "secondary",
                      })}
                    >
                      {user ? "Upgrade now" : "Sign up"}
                      <ArrowRight className="size-5 ml-1.5" />
                    </Link>
                  ) : user ? (
                    <UpgradeButton />
                  ) : (
                    <Link
                      href="/login"
                      className={buttonVariants({
                        className: "w-full",
                      })}
                    >
                      {user ? "Upgrade now" : "Sign up"}
                      <ArrowRight className="h-5 w-5 ml-1.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </TooltipProvider>
      </div>
    </MaxWidthWrapper>
  );
};
export default PricingPage;
