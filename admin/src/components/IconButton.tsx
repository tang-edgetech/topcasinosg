"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "danger" | "muted";

interface IconButtonProps {
  id: string;
  title: string;
  // href makes it a link (e.g. Edit), so it can also be opened in a new tab
  // with Ctrl/Cmd-click, middle-click or the right-click menu.
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  variant?: Variant;
  disabled?: boolean;
}

// Every icon-only action button in the dashboard uses this: solid fill by
// default, outline-on-hover per the design spec, native `title` tooltip.
const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white border-primary-600 hover:bg-transparent hover:text-primary-600 dark:hover:text-primary-300",
  danger: "bg-danger text-white border-danger hover:bg-transparent hover:text-danger",
  muted:
    "bg-primary-100 text-primary-700 border-primary-200 hover:bg-transparent hover:text-primary-700 dark:bg-surface-muted-dark dark:text-text-dark dark:border-border-dark",
};

export default function IconButton({ id, title, href, onClick, icon, variant = "primary", disabled }: IconButtonProps) {
  const className = `icon-button inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]}`;
  if (href && !disabled) {
    return (
      <Link id={id} href={href} title={title} aria-label={title} onClick={onClick} className={className}>
        {icon}
      </Link>
    );
  }
  return (
    <button
      type="button"
      id={id}
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {icon}
    </button>
  );
}
