"use client";

import useFile from "@/hooks/useFile";
import PdfRenderer from "./PdfRenderer";
import ChatWrapper from "./chat/ChatWrapper";

const DetailedFile = ({ fileId }: { fileId: string }) => {
  const { getFile } = useFile();
  const { data: file, isLoading: isFileLoading } = getFile(fileId);

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* left side */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            {!isFileLoading && <PdfRenderer url={file!.url} />}
          </div>
        </div>

        <div className="srink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper fileId={fileId} />
        </div>
      </div>
    </div>
  );
};
export default DetailedFile;
