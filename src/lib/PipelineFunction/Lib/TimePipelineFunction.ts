import { PipelineFunction } from "../PipelineFunction";

function formatCustomTime(date: Date, format: string): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");

  const replacements: Record<string, string> = {
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

export const TimePipelineFunction: PipelineFunction = {
  name: "time",
  process: (context) => {
    const { value, parameters, language } = context;
    const date = toDate(value);

    const format = parameters?.[0];

    switch (format) {
      case undefined:
      case "short":
        return new Intl.DateTimeFormat(language, {
          timeStyle: "short",
        }).format(date);

      case "medium":
        return new Intl.DateTimeFormat(language, {
          timeStyle: "medium",
        }).format(date);

      case "long":
        return new Intl.DateTimeFormat(language, {
          timeStyle: "long",
        }).format(date);
    }

    return formatCustomTime(date, format);
  },
};