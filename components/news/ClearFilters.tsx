"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "@/i18n/routing";

interface ClearFiltersProps {
  label: string;
  href: string;
  visible: boolean;
}

export function ClearFilters({ label, href, visible }: ClearFiltersProps) {
  const router = useRouter();

  if (!visible) return null;

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    router.push(href, { scroll: false });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
