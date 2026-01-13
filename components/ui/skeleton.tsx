/**
 * Skeleton loader component - Shimmer effect for loading states.
 * 
 * Uses CSS animations (not Framer Motion) for performance.
 * Provides professional loading feedback without distraction.
 * 
 * Note: Shimmer currently uses `via-white/10` - this should be
 * updated to a theme-aware color when theme switching is implemented.
 */

import { type HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  ...props
}: SkeletonProps) {
  const baseStyles =
    "relative overflow-hidden bg-muted rounded before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

  const variants = {
    text: "h-4 w-full",
    circular: "h-10 w-10 rounded-full",
    rectangular: "h-20 w-full",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
