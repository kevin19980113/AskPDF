import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Link from "next/link";
import { Gem } from "lucide-react";
import { Icons } from "@/utils/Icons";
import { UseMutateFunction, useQuery } from "@tanstack/react-query";
import { subscriptionPlanType } from "@/types/types";
import { useToken } from "@/hooks/useToken";

interface UserAccountNavProps {
  username: string | undefined;
  handleLogout: UseMutateFunction<
    {
      username: string;
    } | null,
    Error,
    void,
    unknown
  >;
}

const UserAccountNav = ({ username, handleLogout }: UserAccountNavProps) => {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="rounded-full size-8 aspect-square bg-slate-400">
          <Avatar className="relative size-8">
            <AvatarFallback>
              <span className="sr-only">{username}</span>
              <Icons.user className="size-4 text-zinc-900" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          {username && (
            <p className="w-[200px] truncate text-sm font-bold">{username}</p>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          {subscriptionPlan?.isSubscribed && !isLoading ? (
            <Link href="/dashboard/billing">Manage Subscription</Link>
          ) : (
            <Link href="/pricing">
              Upgrade <Gem className="text-purple-600 size-4 ml-1.5" />
            </Link>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => handleLogout()}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
