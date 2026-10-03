import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", padding = "md", children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-sentinel-card border border-sentinel-border",
      hover: "bg-sentinel-card border border-sentinel-border hover:border-sentinel-accent/30 hover:shadow-[0_0_30px_rgba(0,212,170,0.08)] transition-all duration-200",
      glass: "bg-sentinel-card/80 backdrop-blur-sm border border-sentinel-border/50",
    };

    const paddingClasses = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";