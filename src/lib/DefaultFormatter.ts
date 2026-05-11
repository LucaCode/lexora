import { DynamicValue, FormattableResource } from "./DynamicValue";
import { FormatAdapter } from "./FormatAdapter/FormatAdapter";
import { LanguageKey } from "./LanguageKey";
import { SR, StringResource, StringResourceMap } from "./StringResource";

export function formatFormattableResourceDefault(
  value: FormattableResource,
  language: LanguageKey,
  formatAdapter: FormatAdapter
): string {
  if (value instanceof Date) {
    return formatAdapter.formatDate(language, value, {
      dateStyle: "medium",
    });
  }
  if (typeof value === "number" || typeof value === "bigint")
    return formatAdapter.formatNumber(language, value);
  return String(value);
}

export function resolveStringResourceMaps(value: (StringResource | StringResourceMap | FormattableResource), language: LanguageKey): StringResource | FormattableResource {
  if (!Array.isArray(value) && typeof value === "object" && !(value instanceof Date))
    return (value as StringResourceMap)[language];
  else return value;
}

export function ensureString(value: DynamicValue, language: LanguageKey, formatAdapter: FormatAdapter): string {
  if (typeof value === "string") return value;
  if (SR.isStringResource(value)) return SR.getDefaultValue(value);
  if (Array.isArray(value)) return value.map(v => ensureString(v, language, formatAdapter)).join("");
  if (typeof value === "object" && !(value instanceof Date)) return ensureString((value as StringResourceMap)[language], language, formatAdapter);
  return formatFormattableResourceDefault(value, language, formatAdapter);
}