import { FormattableResource } from "./DynamicValue";
import { LanguageKey } from "./LanguageKey";

export function formatFormattableResourceDefault(
  value: FormattableResource,
  language: LanguageKey
): string {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
    }).format(value);
  }
  if (typeof value === "number" || typeof value === "bigint") 
    return new Intl.NumberFormat(language).format(value);
  return String(value);
}