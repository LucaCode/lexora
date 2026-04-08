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

export const DatePipelineFunction: PipelineFunction = {
  name: "date",
  process: (context) => {
    const { value, parameters, language } = context;

    if (!(value instanceof Date)) {
      throw new Error("date: value must be Date");
    }
    const format = parameters?.[0];

    switch (format) {
      case undefined:
      case "medium":
        return new Intl.DateTimeFormat(language, {
          dateStyle: "medium",
        }).format(value);

      case "short":
        return new Intl.DateTimeFormat(language, {
          dateStyle: "short",
        }).format(value);

      case "long":
        return new Intl.DateTimeFormat(language, {
          dateStyle: "long",
        }).format(value);

      case "time":
        return new Intl.DateTimeFormat(language, {
          timeStyle: "short",
        }).format(value);

      case "datetime":
        return new Intl.DateTimeFormat(language, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(value);

      case "iso":
        return value.toISOString();
    }

    if (format) {
      return formatCustomDate(value, format);
    }

    return value.toString();
  },
};