/**
 * Transition utility classes and helpers.
 * 
 * CSS-only transition utilities for consistent animations.
 * Use these instead of Framer Motion for simple transitions.
 */

/**
 * Standard transition classes for common use cases.
 * These can be composed with Tailwind classes.
 */
export const transitions = {
  /**
   * Fast transition (100ms) - for hover states, color changes
   */
  fast: "transition-all duration-100 ease-in-out",
  
  /**
   * Standard transition (150ms) - default for most interactions
   */
  standard: "transition-all duration-150 ease-in-out",
  
  /**
   * Slow transition (200ms) - for page transitions, modals
   */
  slow: "transition-all duration-200 ease-in-out",
  
  /**
   * Fade transition - opacity only
   */
  fade: "transition-opacity duration-150 ease-in-out",
  
  /**
   * Slide transition - transform only
   */
  slide: "transition-transform duration-200 ease-in-out",
} as const;

/**
 * Get transition class for a specific property.
 * Use when you only need to transition specific properties.
 */
export function getTransitionClass(
  properties: string[],
  duration: "fast" | "standard" | "slow" = "standard"
): string {
  const durationMap = {
    fast: "duration-100",
    standard: "duration-150",
    slow: "duration-200",
  };

  const props = properties.map((prop) => `transition-${prop}`).join(" ");

  return `${props} ${durationMap[duration]} ease-in-out`;
}
