/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import { LanguageKey } from "./LanguageKey";

export type StringResource = string | [string, Record<string, any>];
export type StringResourceMap = Record<LanguageKey, StringResource>;

export function stringResourceValue(sr: StringResource): string {
    if (typeof sr === "string") return sr;
    return sr[0];
}