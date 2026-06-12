"use client";

import { Button } from "@workspace/ui/components/button";
import { Icon } from "@workspace/ui/composed/icon";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

interface CopyButtonProps {
  text: string;
  copyLabel?: string;
  copiedLabel?: string;
  variant?: "ghost" | "secondary" | "outline" | "default" | "destructive";
  className?: string;
}

export function CopyButton({
  text,
  copyLabel = "Copy",
  copiedLabel = "Copied!",
  variant = "ghost",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <CopyToClipboard
      onCopy={() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      text={text}
    >
      <Button
        className={`gap-1.5 ${className ?? ""}`}
        size="sm"
        variant={variant}
      >
        <Icon
          className="h-3.5 w-3.5"
          icon={copied ? "uil:check" : "uil:copy"}
        />
        {copied ? copiedLabel : copyLabel}
      </Button>
    </CopyToClipboard>
  );
}
