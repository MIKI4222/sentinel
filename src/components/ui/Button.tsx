import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sentinel-bg disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary: "bg-sentinel-accent text-sentinel-bg hover:bg-sentinel-accentHover focus-visible:ring-sentinel-accent",
      secondary: "bg-sentinel-card border border-sentinel-border text-sentinel-text hover:bg-sentinel-border hover:border-sentinel-accent/50 focus-visible:ring-sentinel-border",
      danger: "bg-sentinel-danger text-white hover:bg-sentinel-dangerHover focus-visible:ring-sentinel-danger",
      ghost: "bg-transparent text-sentinel-textMuted hover:text-sentinel-text hover:bg-sentinel-border focus-visible:ring-sentinel-border",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs rounded-md",
      md: "px-5 py-2.5 text-sm rounded-lg",
      lg: "px-6 py-3 text-base rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";