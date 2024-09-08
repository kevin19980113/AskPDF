import { UseMutateFunction, useQuery } from "@tanstack/react-query";
import { ArrowRight, Gem, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, Fragment } from "react";
import { Button } from "./ui/button";
import { subscriptionPlanType } from "@/types/types";
import { useToken } from "@/hooks/useToken";

type MobileNavProps = {
  isAuth: boolean;
  handleLogout: UseMutateFunction<
    {
      username: string;
    } | null,
    Error,
    void,
    unknown
  >;
};

const MobileNav = ({ isAuth, handleLogout }: MobileNavProps) => {
  const [isOpen, setOpen] = useState<boolean>(false);
  const toggleOpen = () => setOpen((prev) => !prev);
  const pathname = usePathname();

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

        return data as subscriptionPlanType;
      } catch (error: any) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen();
    }
  };

  return (
    <div className="sm:hidden">
      <Menu
        onClick={toggleOpen}
        className="relative z-50 size-5 text-zinc-700"
      />

      {isOpen ? (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
          <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {!isAuth ? (
              <Fragment>
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/signup")}
                    className="flex items-center w-full font-semibold text-green-600"
                    href="/signup"
                  >
                    Get started
                    <ArrowRight className="ml-2 size-5" />
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/login")}
                    className="flex items-center w-full font-semibold"
                    href="/login"
                  >
                    Sign in
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/pricing")}
                    className="flex items-center w-full font-semibold"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
              </Fragment>
            ) : (
              <Fragment>
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/dashboard")}
                    className="flex items-center w-full font-semibold"
                    href="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  {subscriptionPlan?.isSubscribed && !isLoading ? (
                    <Link href="/dashboard/billing">Manage Subscription</Link>
                  ) : (
                    <Link
                      href="/pricing"
                      className="flex items-center space-x-1"
                    >
                      Upgrade <Gem className="text-purple-600 size-4 ml-1.5" />
                    </Link>
                  )}
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Button
                    className="flex items-center w-full font-semibold"
                    onClick={() => handleLogout()}
                  >
                    Log out
                  </Button>
                </li>
              </Fragment>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default MobileNav;
