import { DynamicValue, FormattableResource } from "./DynamicValue";
import { LanguageKey } from "./LanguageKey";
import { SR, StringResource, StringResourceMap } from "./StringResource";

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

export function resolveStringResourceMaps(value: (StringResource | StringResourceMap | FormattableResource), language: LanguageKey): StringResource | FormattableResource {
  if (!Array.isArray(value) && typeof value === "object" && !(value instanceof Date))
    return (value as StringResourceMap)[language];
  else return value;
}

export function ensureString(value: DynamicValue, language: LanguageKey): string {
  if (typeof value === "string") return value;
  if (SR.isStringResource(value)) return SR.getDefaultValue(value);
  if (Array.isArray(value)) return value.map(v => ensureString(v, language)).join("");
  if(typeof value === "object" && !(value instanceof Date)) return ensureString((value as StringResourceMap)[language], language);
  return formatFormattableResourceDefault(value, language);
}