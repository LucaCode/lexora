import { SR, StringResource } from "../StringResource";
import { DynamicValue } from "../DynamicValue";
import { PipelineFunctionsMap } from "./PipelineFunction";
import { LanguageKey } from "../LanguageKey";

export type PipelineFunctionCall = { name: string; params: string[] };

export interface PipelineProcessOptions {
    skipFailedPipelineFunctions?: boolean;
    ignoreMissingPipelineFunctions?: boolean;
}

export function processPipeline(
    value: DynamicValue, 
    originalStringResource: StringResource | undefined, 
    language: LanguageKey,
    pipelineFunctionsMap: PipelineFunctionsMap, 
    pipelineFunctionCalls: PipelineFunctionCall[] = [], 
    options?: PipelineProcessOptions): string 
{
    if (pipelineFunctionCalls.length === 0) return originalStringResource ? String(SR.getValue(originalStringResource)) : String(value);

    let stringResourceContext: Readonly<{ value: string; metadata: Record<string, any> }> | undefined = undefined;
    if (originalStringResource) {
        const stringResourceValue = SR.getValue(originalStringResource);
        const stringResourceMetadata = SR.getMetadata(originalStringResource);
        stringResourceContext = Object.freeze({
            value: stringResourceValue,
            metadata: stringResourceMetadata,
        });
    }

    let currentValue = value;
    for (const pipelineFunctionCall of pipelineFunctionCalls) {
        const pipelineFunction = pipelineFunctionsMap[pipelineFunctionCall.name];
        if (!pipelineFunction) {
            if (options?.ignoreMissingPipelineFunctions) continue;
            else throw new Error(`Pipeline function '${pipelineFunctionCall.name}' not found`);
        }
        try {
            currentValue = pipelineFunction({
                value: currentValue,
                language,
                parameters: pipelineFunctionCall.params,
                stringResource: stringResourceContext,
            });
        }
        catch (err) {
            if (options?.skipFailedPipelineFunctions) continue;
            else throw err;
        }
    }
    return String(currentValue);
}