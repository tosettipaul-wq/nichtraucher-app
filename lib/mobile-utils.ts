/**
 * Mobile optimization utilities
 * Ensures accessibility and usability on small screens
 */

export const MOBILE_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  iphone12: 390, // Test width for iPhone 12
} as const;

/**
 * Tailwind classes for mobile-first design
 * All buttons should be min 44px (11 units) tall for touch targets
 * Text should be base 16px on mobile, scale up on desktop
 */
export const MOBILE_SAFE_CLASSES = {
  // Touch targets (44px minimum)
  buttonHeight: 'h-11',  // 44px
  
  // Form inputs (also 44px minimum)
  inputHeight: 'h-11',
  
  // Padding for safe areas
  touchPadding: 'p-3',   // 12px - safe for 44px elements
  
  // Typography
  baseText: 'text-base', // 16px - readable on mobile
  smallText: 'text-sm',  // 14px - captions only
} as const;

/**
 * Check if touch targets are accessible
 */
export function validateTouchTarget(element: HTMLElement | null): boolean {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const minSize = 44; // WCAG AA minimum
  return rect.height >= minSize && rect.width >= minSize;
}
