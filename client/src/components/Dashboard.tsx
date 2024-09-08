"use client";

import { useState } from "react";
import UploadButton from "./UploadButton";
import { Ghost, Loader2, MessageSquare, Plus, Trash } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import useFile from "@/hooks/useFile";
import { useQuery } from "@tanstack/react-query";
import { subscriptionPlanType } from "@/types/types";
import { useToken } from "@/hooks/useToken";
import { toast } from "sonner";

const Dashboard = () => {
  const [currentlyDeletingFile, setCurrentDeletingFile] = useState<
    string | null
  >(null);
  const { getAllFiles, deleteFile } = useFile();
  const { data: files, isLoading: isFilesLoading } = getAllFiles;
  const { mutate: deleteFileMutation, isPending: isFileDeleting } = deleteFile(
    setCurrentDeletingFile
  );
  const { accessToken } = useToken();
  const { data: subscriptionPlan, isLoading: isPlanLoading } = useQuery({
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

  return (
    <main className="mx-auto max-w-8xl p-6 md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My Files</h1>

        {!isPlanLoading && (
          <UploadButton isSubscribed={subscriptionPlan!.isSubscribed} />
        )}
      </div>

      {/* display all the user's PDF */}
      {files && files?.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => {
              return (
                <li
                  key={file.id}
                  className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
                >
                  <Link
                    href={`/dashboard/${file.id}`}
                    className="flex flex-col gap-2"
                  >
                    <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                      <div className="size-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" />
                      <div className="flex-1 truncate">
                        <div className="flex items-center space-x-3">
                          <h3 className="truncate text-lg font-medium text-zinc-900">
                            {file.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="px-6 mt-4 grid grid-cols-2 place-items-center py-2 gap-6 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Plus className="size-4" />
                      {format(new Date(file.createdAt), "MMM yyyy")}
                    </div>

                    <Button
                      size="sm"
                      className="w-full"
                      variant="destructive"
                      onClick={() => deleteFileMutation(file.id)}
                      disabled={isFileDeleting}
                    >
                      {isFileDeleting && currentlyDeletingFile === file.id ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Trash className="size-4" />
                      )}
                    </Button>
                  </div>
                </li>
              );
            })}
        </ul>
      ) : isFilesLoading ? (
        <Skeleton height={100} className="my-2" count={4} />
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="size-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">Pretty empty around here</h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
