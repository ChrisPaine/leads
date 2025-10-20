import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Helper function to format volume numbers with K/M abbreviations
export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
};

// Helper function to get proper indentation class based on level
export const getIndentClass = (level: number): string => {
  switch (level) {
    case 0: return 'pl-3 font-semibold text-primary';
    case 1: return 'pl-5 font-medium';
    case 2: return 'pl-7';
    case 3: return 'pl-9 text-sm';
    case 4: return 'pl-11 text-sm text-muted-foreground';
    default: return 'pl-3';
  }
};

// Helper function to format display name with proper indentation indicators
export const formatDisplayName = (name: string, level: number): string => {
  if (level === 0) return name;
  const indent = '  '.repeat(level - 1);
  const bullet = level === 1 ? '•' : level === 2 ? '◦' : level === 3 ? '▪' : '▫';
  return `${indent}${bullet} ${name}`;
};
