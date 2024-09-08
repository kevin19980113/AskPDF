"use client";

import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { Cloud, FileIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Progress } from "./ui/progress";
import { DialogTitle } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";
import useFile from "@/hooks/useFile";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";

const UploadDropzone = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { pollingFile } = useFile();
  const { mutate: startPolling } = pollingFile;

  const { accessToken } = useToken();

  const router = useRouter();

  const { startUpload } = useUploadThing(
    isSubscribed ? "proPlanUploader" : "freePlanUploader",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const startSimulatedProgress = () => {
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 400);

    return interval;
  };

  const handleUploadFile = async (acceptedFile: File[]) => {
    if (isUploading) return;
    if (acceptedFile.some((file) => !file.type.includes("application/pdf")))
      return toast.info("Please upload a PDF file.");

    if (acceptedFile.length !== 1)
      return toast.info("Please upload only one PDF file.");

    setIsUploading(true);
    const progressInterval = startSimulatedProgress();

    const res = await startUpload(acceptedFile);
    if (!res)
      return toast.error("Failed to upload file Please try again later.");

    const [fileResponse] = res;

    const key = fileResponse.key;
    if (!key)
      return toast.error("Failed to upload file. Please try again later.");

    clearInterval(progressInterval);
    setProgress(100);
    startPolling(key, {
      onSuccess: (file) => {
        router.push(`/dashboard/${file!.id}`);
      },
    });
  };

  return (
    <Dropzone
      onDrop={async (acceptedFile) => {
        handleUploadFile(acceptedFile);
      }}
    >
      {({ getRootProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center w-full h-full">
            <label
              htmlFor="dropzone-file"
              className={`flex flex-col items-center justify-center w-full h-full rounded-lg bg-gray-50 hover:bg-gray-100 ${
                isUploading ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="size-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-sm text-zinc-500">
                  PDF (up to {isSubscribed ? "16" : "4"}mb)
                </p>
              </div>

              {((acceptedFiles && acceptedFiles[0]) || uploadedFile) &&
                isUploading && (
                  <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-1 outline-zinc-200 divide-x divide-zinc-200">
                    <div className="px-3 py-2 h-full grid place-items-center">
                      <FileIcon className="size-4 text-purple-500" />
                    </div>
                    <div className="px-3 py-2 h-full text-sm truncate">
                      {uploadedFile?.name || acceptedFiles[0].name}
                    </div>
                  </div>
                )}

              {isUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    indicatorColor={progress === 100 ? "bg-green-500" : ""}
                    value={progress}
                    className="h-1 w-full bg-zinc-200"
                  />
                  {progress === 100 && (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="size-3 animate-spin text-purple-500" />
                      Redirecting...
                    </div>
                  )}
                </div>
              ) : null}

              <input
                type="file"
                id="dropzone-file"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadedFile(file);
                    handleUploadFile([file]);
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

const UploadButton = ({ isSubscribed }: { isSubscribed: boolean }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Upload PDF</DialogTitle>
        <UploadDropzone isSubscribed={isSubscribed} />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
