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
        if (metadata) return [value, metadata];
        return value;
    }
    export function getValue(sr: StringResource): string;
    export function getValue(sr: null | undefined | StringResource): null | string;
    export function getValue(sr: StringResource | null | undefined): string | null {
        if (sr == null) return null;
        return typeof sr === "string" ? sr : sr[0];
    }
    export function getMetadata(sr: StringResource): Record<string, any>;
    export function getMetadata(sr: null | undefined | StringResource): null | Record<string, any>;
    export function getMetadata(sr: StringResource | null | undefined): Record<string, any> | null {
        if (sr == null) return null;
        if (typeof sr === "string") return {};
        return sr[1] ?? {};
    }
    export function setMetadata(sr: StringResource | null | undefined, newMetadata: Record<string, any>): StringResource {
        if(sr == null) return create("", newMetadata);
        const value = getValue(sr);
        return create(value, { ...getMetadata(sr), ...newMetadata });
    }
    export function setValue(sr: StringResource | null | undefined, newValue: string): StringResource {
        if(sr == null || typeof sr === "string") return create(newValue);
        return create(newValue, getMetadata(sr));
    }
}