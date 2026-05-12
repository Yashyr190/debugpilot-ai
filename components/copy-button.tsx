"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={copyText}
      className="premium-control inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-slate-200 hover:border-teal-300/50 hover:bg-teal-300/10 hover:text-white"
      title={label}
    >
      {copied ? <Check className="h-4 w-4 text-teal-300" /> : <Copy className="h-4 w-4" />}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
