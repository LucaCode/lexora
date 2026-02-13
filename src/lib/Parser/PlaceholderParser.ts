import { PipelineFunctionCall } from "../PipelineFunction/PipelineProcessor";

export type PlaceholderResolver = (
  key: string,
  pipelines: PipelineFunctionCall[],
  raw: string
) => string;

const KEY_FORBIDDEN = /->|\(|\)|,|\{\{|\}\}/;

function isWs(c: string) {
  return c === " " || c === "\n" || c === "\r" || c === "\t";
}
function isNameChar(c: string) {
  const code = c.charCodeAt(0);
  return (
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    c === "_" ||
    c === "-"
  );
}

function findClosingParen(inner: string, start: number): number {
  let i = start;
  let quote: "'" | '"' | null = null;

  while (i < inner.length) {
    const ch = inner[i];

    if (quote) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === quote) {
        quote = null;
        i++;
        continue;
      }
      i++;
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      i++;
      continue;
    }

    if (ch === ")") return i;

    i++;
  }

  return -1;
}

function splitArgsQuoted(argText: string): string[] {
  const res: string[] = [];
  let i = 0;

  const skipWs = () => {
    while (i < argText.length && isWs(argText[i])) i++;
  };

  const readUnquoted = (): string => {
    const start = i;
    while (i < argText.length && argText[i] !== ",") i++;
    let a = start;
    let b = i;
    while (a < b && isWs(argText[a])) a++;
    while (b > a && isWs(argText[b - 1])) b--;
    return argText.slice(a, b);
  };

  const readQuoted = (q: "'" | '"'): string => {
    i++;
    let out = "";

    while (i < argText.length) {
      const ch = argText[i];

      if (ch === "\\") {
        const next = argText[i + 1];
        if (next != null) {
          // \" \' \\
          out += next;
          i += 2;
          continue;
        }
        i++; // trailing backslash
        continue;
      }

      if (ch === q) {
        i++; // closing quote
        return out;
      }

      out += ch;
      i++;
    }
    throw new Error("Unterminated quoted parameter");
  };

  while (i < argText.length) {
    skipWs();
    if (i >= argText.length) break;

    let value = "";
    const ch = argText[i];

    if (ch === "'" || ch === '"') {
      value = readQuoted(ch);
      skipWs();
    } else {
      value = readUnquoted();
    }

    if (value.length > 0) res.push(value);

    skipWs();
    if (argText[i] === ",") i++;
  }

  return res;
}

function parseInnerFast(inner: string): { key: string; pipelines: PipelineFunctionCall[] } {
  let i = 0;

  const skipWs = () => {
    while (i < inner.length && isWs(inner[i])) i++;
  };

  const readTokenUntilWsOrArrow = () => {
    skipWs();
    const start = i;
    while (i < inner.length && !isWs(inner[i]) && !(inner[i] === "-" && inner[i + 1] === ">")) i++;
    return inner.slice(start, i);
  };

  const key = readTokenUntilWsOrArrow().trim();
  if (!key) throw new Error("Missing key");
  if (KEY_FORBIDDEN.test(key)) throw new Error("Invalid key");

  const pipelines: PipelineFunctionCall[] = [];

  while (true) {
    skipWs();
    if (!(inner[i] === "-" && inner[i + 1] === ">")) break;
    i += 2;

    skipWs();
    const nameStart = i;
    while (i < inner.length && isNameChar(inner[i])) i++;
    const name = inner.slice(nameStart, i);
    if (!name) throw new Error("Missing pipeline name");

    skipWs();
    skipWs();
    let params: string[] = [];
    if (inner[i] === "(") {
      i++;
      const argsStart = i;

      const close = findClosingParen(inner, i);
      if (close === -1) throw new Error("Missing ')'");

      const argText = inner.slice(argsStart, close);
      params = splitArgsQuoted(argText);

      i = close + 1;
    }
    pipelines.push({ name, params });
  }

  skipWs();
  if (i < inner.length && inner.slice(i).trim()) throw new Error("Unexpected content");
  return { key, pipelines };
}

export function replacePlaceholdersFast(
  input: string,
  resolver: PlaceholderResolver
): string {
  let out = "";
  let i = 0;

  while (i < input.length) {
    const open = input.indexOf("{{", i);
    if (open === -1) {
      out += input.slice(i);
      break;
    }

    out += input.slice(i, open);

    const close = input.indexOf("}}", open + 2);
    if (close === -1) {
      out += input.slice(open);
      break;
    }

    const raw = input.slice(open, close + 2);
    const inner = input.slice(open + 2, close);

    let replacement: string;
    const { key, pipelines } = parseInnerFast(inner);
    replacement = resolver(key, pipelines, raw);

    out += replacement;
    i = close + 2;
  }

  return out;
}