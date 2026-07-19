"use client";

import { useState } from "react";

/** Small copy-to-clipboard button for bonus coupon codes. */
export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may be unavailable (e.g. insecure context) — ignore.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : `Copy code ${code}`}
      className="region-bonus-card__code cursor-pointer rounded-md border border-dashed border-secondary-600 bg-secondary-50 px-3 py-1.5 text-sm font-semibold tracking-wide text-primary-900 transition-colors hover:bg-secondary-100"
    >
      {copied ? "Copied!" : code}
    </button>
  );
}
