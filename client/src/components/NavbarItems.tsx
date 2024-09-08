import Link from "next/link";
import { Fragment } from "react";
import { buttonVariants } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { UseMutateFunction } from "@tanstack/react-query";
import UserAccountNav from "./UserAccoutNav";
import { UserType } from "@/types/types";

type NavbarItemsProps = {
  user: UserType;
  handleLogout: UseMutateFunction<
    {
      username: string;
    } | null,
    Error,
    void,
    unknown
  >;
};

const NavbarItems = ({ user, handleLogout }: NavbarItemsProps) => {
  return (
    <div className="hidden items-center space-x-4 sm:flex">
      <Link
        href="/pricing"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
        })}
      >
        Pricing
      </Link>
      {user ? (
        <UserAccountNav username={user.username} handleLogout={handleLogout} />
      ) : (
        <Fragment>
          <Link
            href="/login"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
            })}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({
              size: "sm",
            })}
          >
            Get started <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Fragment>
      )}
    </div>
  );
};

export default NavbarItems;
