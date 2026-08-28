import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDate(val: any): Date | null {
  if (!val) return null;
  if (typeof val?.toDate === "function") {
    try {
      return val.toDate();
    } catch {
      // ignore
    }
  }
  const seconds = val?.seconds ?? val?._seconds;
  if (typeof seconds === "number") {
    return new Date(seconds * 1000);
  }
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(
  val: any,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
): string {
  const d = parseDate(val);
  if (!d) {
    return typeof val === "string" ? val : "";
  }
  return d.toLocaleDateString("en-US", options);
}
