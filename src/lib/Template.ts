/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

/***
 * Returns a placeholder for a template.
 */
export function ph(name: string, ...args: (number | string)[]): string {
    return `{{${name}${args.length > 0 ? ("(" + args.map(a => JSON.stringify(a)).join(",") + ")") : ""}}}`;
}