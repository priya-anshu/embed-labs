/**
 * Fade transition component - Subtle Framer Motion wrapper.
 * 
 * This is the ONLY place Framer Motion should be used.
 * All other transitions should use CSS.
 * 
 * Use sparingly - only when CSS transitions aren't sufficient.
 */

"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

export interface FadeProps {
  children: ReactNode;
  duration?: number;
  className?: string;
}

/**
 * Subtle fade-in animation for page transitions or modals.
 * Duration defaults to 0.2s for minimal distraction.
 */
export function Fade({ children, duration = 0.2, className = "" }: FadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
