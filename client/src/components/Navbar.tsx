"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import NavbarItems from "./NavbarItems";
import MobileNav from "./MobileNav";
import useAuth from "@/hooks/useAuth";
import { Fragment } from "react";

const Navbar = () => {
  const { getAuthUser, logout } = useAuth();
  const { data: authUser, isLoading } = getAuthUser;
  const { mutate: handleLogout } = logout;

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            AskPDF
          </Link>

          {isLoading ? null : (
            <Fragment>
              <MobileNav isAuth={!!authUser} handleLogout={handleLogout} />
              <NavbarItems user={authUser} handleLogout={handleLogout} />
            </Fragment>
          )}
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
