import { routing } from "./routing";

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: unknown): value is Locale {
  return routing.locales.some((locale) => locale === value);
}
