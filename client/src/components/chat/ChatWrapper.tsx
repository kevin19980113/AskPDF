import useFile from "@/hooks/useFile";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "../../contexts/ChatContext";
import { useToken } from "@/hooks/useToken";
import { useQuery } from "@tanstack/react-query";
import { subscriptionPlanType } from "@/types/types";
import { toast } from "sonner";
import { PLANS } from "@/utils/price";

type ChatWrapperProps = {
  fileId: string;
};

const ChatWrapper = ({ fileId }: ChatWrapperProps) => {
  const { getFileUploadStatus } = useFile();
  const { data, isFetching } = getFileUploadStatus(fileId);
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

  if (isFetching)
    return (
      <div className="relative min-h-full bg-zinc-50 divide-y divide-zinc-200 flex-col items-center justify-center gap-2">
        <div className="flex-1 min-h-[calc(100vh-10rem)] flex justify-center items-center flex-col my-auto">
          <div className="h-full flex flex-col justify-center items-center gap-2">
            <Loader2 className="size-8 text-purple-400 animate-spin" />
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>
      </div>
    );

  if (data?.status === "PROCESSING")
    return (
      <div className="relative min-h-full bg-zinc-50 divide-y divide-zinc-200 flex-col items-center justify-center gap-2">
        <div className="flex-1 min-h-[calc(100vh-10rem)] flex justify-center items-center flex-col my-auto">
          <div className="h-full flex flex-col justify-center items-center gap-2">
            <Loader2 className="size-8 text-purple-400 animate-spin" />
            <h3 className="font-semibold text-xl">Processing PDF...</h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
          </div>
        </div>
      </div>
    );

  if (data?.status === "FAILED")
    return (
      <div className="relative min-h-full bg-zinc-50 divide-y divide-zinc-200 flex-col items-center justify-center gap-2">
        <div className="flex-1 min-h-[calc(100vh-10rem)] flex justify-center items-center flex-col my-auto">
          <div className="h-full flex flex-col justify-center items-center gap-2">
            <XCircle className="size-8 text-red-500" />
            <h3 className="font-semibold text-xl">Too many pages in PDF</h3>
            <p className="text-zinc-500 text-sm">
              Your{" "}
              <span className="font-medium text-purple-500">
                {subscriptionPlan?.name}
              </span>{" "}
              plan supports up to{" "}
              {subscriptionPlan?.isSubscribed
                ? PLANS[1].pagesPerPdf
                : PLANS[0].pagesPerPdf}{" "}
              pages per PDF.
            </p>
            <p className="text-zinc-500 text-sm">
              Please upgrade your plan and upload PDF again.
            </p>
            <div className="flex items-center space-x-2 mt-4">
              <Link
                href="/dashboard"
                className={buttonVariants({
                  variant: "secondary",
                })}
              >
                <ChevronLeft className="size-3 mr-1.5" />
                Back
              </Link>
              <Link href="/pricing" className={buttonVariants()}>
                Upgrade
              </Link>
            </div>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );

  // status === "SUCCESS"
  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex flex-col divide-y divide-zinc-200 justify-between gap-3">
        <div className="flex-1 justify-between flex flex-col mb-28 py-4">
          <Messages fileId={fileId} />
        </div>

        <ChatInput />
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;
