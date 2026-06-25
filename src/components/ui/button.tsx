"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "./spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, disabled, style, children, ...props }, ref) => {
    const variantStyle: React.CSSProperties =
      variant === "default"
        ? { backgroundColor: "var(--site-fg, #111827)", color: "var(--site-bg, white)" }
        : variant === "outline"
        ? {
            border: "1px solid color-mix(in srgb, var(--site-fg, #111827) 30%, transparent)",
            color: "var(--site-fg, #111827)",
            backgroundColor: "transparent",
          }
        : {};

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{ ...variantStyle, ...style }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:opacity-80",
          variant === "default" && "",
          variant === "destructive" && "bg-red-600 text-white hover:bg-red-700 hover:opacity-100",
          variant === "outline" && "",
          variant === "ghost" && "hover:opacity-60 hover:opacity-100",
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-4 text-sm",
          size === "lg" && "h-12 px-6 text-base",
          className
        )}
        {...props}
      >
        {loading && <Spinner className="h-4 w-4" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
