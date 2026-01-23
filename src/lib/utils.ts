import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Number formatting utility
export function formatNumber(value: number, prefix = ''): string {
  // Round to nearest integer as requested
  const integerValue = Math.round(value);
  // Format with thousands separator
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(integerValue);
  
  return `${prefix}${formatted}`;
}
