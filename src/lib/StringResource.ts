/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import { LanguageKey } from "./LanguageKey";

export type StringResource = string | [string, Record<string, any>];
export type StringResourceMap = Record<LanguageKey, StringResource>;

export namespace SR {
    export function create(value: string, metadata?: Record<string, any>): StringResource {
        if (!metadata || Object.keys(metadata).length === 0) return value;
        return [value, metadata];
    }
    export function getValue(sr: StringResource): string;
    export function getValue(sr: null | undefined | StringResource): undefined | string;
    export function getValue(sr: StringResource | null | undefined): string | undefined {
        if (sr == null) return undefined;
        return typeof sr === "string" ? sr : sr[0];
    }
    export function getMetadata(sr: StringResource): Record<string, any>;
    export function getMetadata(sr: null | undefined | StringResource): undefined | Record<string, any>;
    export function getMetadata(sr: StringResource | null | undefined): Record<string, any> | undefined {
        if (sr == null) return undefined;
        if (typeof sr === "string") return {};
        return sr[1] ?? {};
    }
    export function setMetadata(sr: StringResource | null | undefined, newMetadata: Record<string, any>): StringResource {
        if (sr == null) return create("", newMetadata);
        const value = getValue(sr);
        return create(value, { ...getMetadata(sr), ...newMetadata });
    }
    export function setValue(sr: StringResource | null | undefined, newValue: string): StringResource {
        if (sr == null || typeof sr === "string") return create(newValue);
        return create(newValue, getMetadata(sr));
    }
    export function merge(sr1: StringResource | null | undefined, sr2: StringResource | null | undefined): StringResource | undefined {
        if (sr1 == null && sr2 == null) return undefined;
        if (sr1 == null) return sr2!;
        if (sr2 == null) return sr1!;
        const value = getValue(sr2) || getValue(sr1) || "";
        const metadata = { ...getMetadata(sr1), ...getMetadata(sr2) };
        return create(value, metadata);
    }
}