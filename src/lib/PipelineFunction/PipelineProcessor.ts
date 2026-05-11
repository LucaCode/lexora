import { StringResource } from "../StringResource";
import { DynamicValue } from "../DynamicValue";
import { PipelineFunction, PipelineFunctionsMap } from "./PipelineFunction";
import { LanguageKey } from "../LanguageKey";
import { FormatAdapter, TranslateCallContext } from "../..";
import { ensureString } from "../DefaultFormatter";

export type DeclaredPipelineFunctionCall = { name: string; params: string[] };
export type PipelineFunctionCall<T extends PipelineFunction = PipelineFunction> = { pipeline: T; params: string[] };

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
    callContext: Readonly<TranslateCallContext>,
    executionContext: Record<string, any>,
    formatAdapter: FormatAdapter,
    options: PipelineProcessOptions): string
{
    if (pipelineFunctionCalls.length === 0) return ensureString(value, language, formatAdapter);

    let currentValue = value;
    for (const pipelineFunctionCall of pipelineFunctionCalls) {
        const processPipelineFunction = pipelineFunctionCall.pipeline.process;
        try {
            currentValue = processPipelineFunction({
                value: currentValue,
                language,
                parameters: pipelineFunctionCall.params,
                stringResource: originalStringResource,
                callContext,
                executionContext,
                formatAdapter,
            });
        }
        catch (err) {
            if (options?.skipFailedPipelineFunctions) continue;
            else throw err;
        }
    }
    return ensureString(currentValue, language, formatAdapter);
}