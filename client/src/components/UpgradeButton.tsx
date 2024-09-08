"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { useToken } from "@/hooks/useToken";
import { toast } from "sonner";
import { useState } from "react";

const UpgradeButton = () => {
  const { accessToken } = useToken();
  const [isCheckingout, setIsCheckingout] = useState(false);

  const { mutate: checkout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/checkout/create-session", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();

        if (!res.ok)
          throw new Error(
            data.error || "An error occurred Please try again later."
          );

        window.location.href = data.url;
      } catch (error: any) {
        toast.error(error.message);
      }
    },
    onMutate: () => setIsCheckingout(true),
    onSettled: () => setIsCheckingout(false),
  });
  return (
    <Button
      className="w-full"
      onClick={() => checkout()}
      disabled={isCheckingout}
    >
      Upgrade now <ArrowRight className="size-5 ml-1.5" />
    </Button>
  );
};

export default UpgradeButton;
