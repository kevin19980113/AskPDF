import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <Loader2 className="size-6 text-purple-500 animate-spin" />
    </div>
  );
}
