import { Dialog, DialogContent } from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { Document, Page } from "react-pdf";
import { toast } from "sonner";
import { useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import { PdfRendererProps } from "./PdfRenderer";

const PdfFullScreen = ({ url }: PdfRendererProps) => {
  const [numPages, setNumPages] = useState<number>();
  const { width: resizeWidth, ref: resizeRef } = useResizeDetector();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button aria-label="fullscreen" className="gap-1.5" variant="ghost">
          <Expand className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-7xl w-full" aria-describedby={undefined}>
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={resizeRef}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="size-6 my-24 animate-spin text-purple-400" />
                </div>
              }
              onLoadError={() => {
                toast.error("Failed to load PDF file. Please try again later.");
              }}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
              }}
              file={url}
              className="max-h-full"
            >
              {new Array(numPages).fill(0).map((_, i) => (
                <Page
                  key={i}
                  width={resizeWidth ? resizeWidth : 1}
                  pageNumber={i + 1}
                />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullScreen;
