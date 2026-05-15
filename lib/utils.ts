import { format } from "date-fns";

export function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
