"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import { toast } from "react-toastify";

interface CopyTextButtonProps {
  text: string;
  className?: string;
}

function CopyTextButton({ text, className }: CopyTextButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  React.useEffect(() => {
    if (isCopied) {
      if (window.innerWidth < 768) {
        toast.info("Coppied to clipboard");
      }

      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    }
  }, [isCopied]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
  };

  return (
    <Button
      onClick={handleCopyText}
      className={cn(
        "size-6 flex justify-center items-center rounded-sm bg-slate-100 hover:bg-slate-200",
        className
      )}
      variant="secondary">
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}

export default CopyTextButton;
