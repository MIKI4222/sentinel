import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "active" | "paused" | "warning" | "neutral" | "info";
  size?: "sm" | "md";
}

export function Badge({ className = "", variant = "neutral", size = "md", children, ...props }: BadgeProps) {
  const variantClasses = {
    active: "bg-sentinel-accent/15 text-sentinel-accent border border-sentinel-accent/30",
    paused: "bg-sentinel-danger/15 text-sentinel-danger border border-sentinel-danger/30",
    warning: "bg-sentinel-warning/15 text-sentinel-warning border border-sentinel-warning/30",
    neutral: "bg-sentinel-border text-sentinel-textMuted border border-sentinel-border",
    info: "bg-sentinel-info/15 text-sentinel-info border border-sentinel-info/30",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}