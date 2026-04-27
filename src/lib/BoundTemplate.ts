/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import { TranslateCallContext } from "./LexoraContext";
import { StringResourceMap } from "./StringResource";

export const BoundTemplateKey = Symbol("BoundTemplate");

export type BoundTemplate = {
    template: string | StringResourceMap, 
    context: TranslateCallContext,
    [BoundTemplateKey]: true
};

export function boundTemplate(template: string | StringResourceMap = "", context: TranslateCallContext = {}): BoundTemplate {
    return { template, context, [BoundTemplateKey]: true };
}   

export function isBoundTemplate(value: any): value is BoundTemplate {
    return typeof value === "object" && value != null && value[BoundTemplateKey] === true;
}