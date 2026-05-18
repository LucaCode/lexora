/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import { PluralRule } from "./FormatAdapter/FormatAdapter";
import { LanguageKey } from "./LanguageKey";

export type StringForms =
    Partial<Record<PluralRule, string>> & {
        _: string;
    };

export type StringResourceValue = string | StringForms;

export type StringResource =
    | StringResourceValue
    | [StringResourceValue, Record<string, any>];

export type StringResourceMap =
    Record<LanguageKey, StringResource>;

export namespace SR {
    export function isForms(value: any): value is StringForms {
        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            typeof value._ === "string"
        );
    }

    export function isStringResource(
        value: any
    ): value is StringResource {
        return (
            typeof value === "string" ||
            isForms(value) ||
            (
                Array.isArray(value) &&
                value.length <= 2 &&
                (
                    typeof value[0] === "string" ||
                    isForms(value[0])
                ) &&
                (
                    value[1] === undefined ||
                    typeof value[1] === "object"
                )
            )
        );
    }

    export function hasForms(sr: StringResource): boolean {
        const value = getValue(sr);
        return isForms(value);
    }

    export function create(
        value: StringResourceValue,
        metadata?: Record<string, any>
    ): StringResource {
        if (
            !metadata ||
            Object.keys(metadata).length === 0
        ) {
            return value;
        }

        return [value, metadata];
    }

    export function getValue(
        sr: StringResource
    ): StringResourceValue;
    export function getValue(
        sr: null | undefined | StringResource
    ): undefined | StringResourceValue;
    export function getValue(
        sr: StringResource | null | undefined
    ): StringResourceValue | undefined {
        if (sr == null) return undefined;

        return Array.isArray(sr)
            ? sr[0]
            : sr;
    }

    export function getMetadata(
        sr: StringResource
    ): Record<string, any>;

    export function getMetadata(
        sr: null | undefined | StringResource
    ): undefined | Record<string, any>;

    export function getMetadata(
        sr: StringResource | null | undefined
    ): Record<string, any> | undefined {
        if (sr == null) return undefined;

        if (!Array.isArray(sr)) {
            return {};
        }

        return sr[1] ?? {};
    }

    export function setMetadata(
        sr: StringResource | null | undefined,
        newMetadata: Record<string, any>
    ): StringResource {
        if (sr == null) {
            return create("", newMetadata);
        }

        const value = getValue(sr);

        return create(value!, {
            ...getMetadata(sr),
            ...newMetadata,
        });
    }

    export function setValue(
        sr: StringResource | null | undefined,
        newValue: StringResourceValue
    ): StringResource {
        if (
            sr == null ||
            !Array.isArray(sr)
        ) {
            return create(newValue);
        }

        return create(
            newValue,
            getMetadata(sr)
        );
    }

    export function merge(
        sr1: StringResource | null | undefined,
        sr2: StringResource | null | undefined
    ): StringResource | undefined {
        if (sr1 == null && sr2 == null) {
            return undefined;
        }

        if (sr1 == null) return sr2!;
        if (sr2 == null) return sr1!;

        const value =
            getValue(sr2) ??
            getValue(sr1) ??
            "";

        const metadata = {
            ...getMetadata(sr1),
            ...getMetadata(sr2),
        };

        return create(value, metadata);
    }

    export function getDefaultValue(
        sr: StringResource
    ): string;
    export function getDefaultValue(
        sr: null | undefined | StringResource
    ): undefined | string;
    export function getDefaultValue(sr: StringResource | null | undefined): string | undefined {
        if(sr == null) return undefined;
        const value = getValue(sr);
        if (typeof value === "string") return value;
        if (SR.isForms(value)) return value._;
        return "";
    }

    export function clone(sr: StringResource): StringResource {
        const value = getValue(sr);
        const metadata = getMetadata(sr);
        return create(SR.isForms(value) ? { ...value } : value, { ...metadata });
    }
}