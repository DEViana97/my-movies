import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-black/[0.12] bg-white px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) dark:border-white/20 dark:bg-black/30 dark:text-white dark:placeholder:text-white/60 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
