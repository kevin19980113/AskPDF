import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Fragment } from "react";
import Preview from "@/components/Preview";
import Features from "@/components/Features";

export default function Home() {
  return (
    <Fragment>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <div
          className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 
      overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hvoer:bg-white/50"
        >
          <p className="text-sm font-semibold text-gray-700">
            AskPDF is now public!
          </p>
        </div>
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Chat with your <span className="text-purple-600">documents</span> in
          seconds.
        </h1>
        <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
          AskPDF allows you to have conversations with any PDF document. simply
          upload your file and start asking questions right away.
        </p>

        <Link
          href="/dashboard"
          className={buttonVariants({
            size: "lg",
            className: "mt-5",
          })}
        >
          Get Started <ArrowRight className="ml-2 size-5" />
        </Link>
      </MaxWidthWrapper>

      <Preview />
      <Features />
    </Fragment>
  );
}
