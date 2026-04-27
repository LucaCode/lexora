import { PipelineFunction } from "../PipelineFunction";

function formatCustomDate(date: Date, format: string): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");

  const replacements: Record<string, string> = {
    yyyy: String(date.getFullYear()),
    yy: String(date.getFullYear()).slice(-2),

    MM: pad(date.getMonth() + 1),
    M: String(date.getMonth() + 1),

    dd: pad(date.getDate()),
    d: String(date.getDate()),

    HH: pad(date.getHours()),
    H: String(date.getHours()),

    mm: pad(date.getMinutes()),
    m: String(date.getMinutes()),

    ss: pad(date.getSeconds()),
    s: String(date.getSeconds()),
  };

  const tokens = Object.keys(replacements).sort((a, b) => b.length - a.length);
  let result = format;
  for (const token of tokens) {
    result = result.split(token).join(replacements[token]);
  }

  return result;
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);

  throw new Error("time: value must be Date or number timestamp");
}

export const DatePipelineFunction: PipelineFunction = {
  name: "date",
  type: "value",
  process: (context) => {
    const { value, parameters, language } = context;
    const date = toDate(value);

    const format = parameters?.[0];

    switch (format) {
      case undefined:
      case "medium":
        return new Intl.DateTimeFormat(language, {
          dateStyle: "medium",
        }).format(date);

      case "short":
        return new Intl.DateTimeFormat(language, {
          dateStyle: "short",
        }).format(date);

      case "long":
        return new Intl.DateTimeFormat(language, {
          dateStyle: "long",
        }).format(date);

      case "time":
        return new Intl.DateTimeFormat(language, {
          timeStyle: "short",
        }).format(date);

      case "datetime":
        return new Intl.DateTimeFormat(language, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);

      case "iso":
        return date.toISOString();
    }

    if (format) {
      return formatCustomDate(date, format);
    }
    return date.toString();
  },
};