import { SR, StringResource } from "../StringResource";
import { DynamicValue } from "../DynamicValue";
import { PipelineFunction, PipelineFunctionsMap } from "./PipelineFunction";
import { LanguageKey } from "../LanguageKey";

export type DeclaredPipelineFunctionCall = { name: string; params: string[] };
export type PipelineFunctionCall = { pipeline: PipelineFunction; params: string[] };

export interface PipelineProcessOptions {
    skipFailedPipelineFunctions?: boolean;
    ignoreMissingPipelineFunctions?: boolean;
}

export function resolvePipelineFunctionCalls(pipelineFunctionCalls: DeclaredPipelineFunctionCall[], 
    pipelineFunctionsMap: PipelineFunctionsMap, ignoreMissingPipelineFunctions?: boolean): PipelineFunctionCall[] 
{
    const pipelineCalls: PipelineFunctionCall[] = [];
    for (const call of pipelineFunctionCalls) {
        const pipelineFunction = pipelineFunctionsMap[call.name];
        if (!pipelineFunction) {
            if (ignoreMissingPipelineFunctions) continue;
            else throw new Error(`Pipeline function '${call.name}' not found`);
        }
        pipelineCalls.push({
            pipeline: pipelineFunction,
            params: call.params,
        });
    }
    return pipelineCalls;
}

export function processPipeline(
    value: DynamicValue, 
    originalStringResource: StringResource | undefined, 
    language: LanguageKey,
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
        const processPipelineFunction = pipelineFunctionCall.pipeline.process;
        try {
            currentValue = processPipelineFunction({
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