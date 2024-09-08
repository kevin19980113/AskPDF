"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useResizeDetector } from "react-resize-detector";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullScreen from "./PdfFullScreen";

export type PdfRendererProps = {
  url: string;
};

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { width: resizeWidth, ref: resizeRef } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const pageInputValidator = z.object({
    page: z
      .string()
      .refine((val) => Number(val) > 0 && Number(val) <= numPages!),
  });
  type pageInputValidatorType = z.infer<typeof pageInputValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<pageInputValidatorType>({
    resolver: zodResolver(pageInputValidator),
    defaultValues: { page: "1" },
  });

  const handlePageSubmit = ({ page }: pageInputValidatorType) => {
    setCurrentPage(Number(page));
    setValue("page", String(page));
  };

  return (
    <div className="w-full bg-white rounded-md flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Button
            aria-label="previous page"
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              setValue("page", String(currPage - 1));
            }}
            disabled={currPage === 1}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-2 ml-1">
              <span>/</span>
              <span>{numPages ?? "..."}</span>
            </p>
          </div>

          <Button
            aria-label="next page"
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1
              );
              setValue("page", String(currPage + 1));
            }}
            disabled={currPage === numPages || numPages === undefined}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="size-4" />
                {scale * 100}%<ChevronDown className="size-4 opacity-40" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.2)}>
                120%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.8)}>
                180%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(3)}>
                300%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            aria-label="rotate 90 degrees"
            onClick={() => setRotation((prev) => prev + 90)}
          >
            <RotateCw className="size-4" />
          </Button>

          <PdfFullScreen url={url} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar
          autoHide={false}
          className="max-h-[calc(100vh-10rem)]"
          classNames={{
            scrollbar: "simplebar-scrollbar",
          }}
        >
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
              {/* Double buffering for removing blinking when user changes scale */}
              {scale !== renderedScale ? (
                <Page
                  width={resizeWidth ? resizeWidth : 1}
                  pageNumber={currPage}
                  scale={renderedScale || scale}
                  rotate={rotation}
                  key={"@" + renderedScale}
                  className={cn(renderedScale === null ? "hidden" : "")}
                />
              ) : null}

              <Page
                className={cn(scale !== renderedScale ? "hidden" : "")}
                width={resizeWidth ? resizeWidth : 1}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};
export default PdfRenderer;
