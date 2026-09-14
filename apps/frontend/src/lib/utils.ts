import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge conditional class names with Tailwind deduplication.
 *
 * @param inputs - Variable list of class values, objects, or arrays.
 * @returns Combined and optimized class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
