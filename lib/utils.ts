import { tz } from '@date-fns/tz';
import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function displayUKDateTime(date: Date, formatString?: string) {
  return format(date, formatString ?? 'PPP', { in: tz('Europe/London') });
}
