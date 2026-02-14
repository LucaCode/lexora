import { SR, StringResource } from "../StringResource";
import { PipelineFunctionsMap } from "./PipelineFunction";

export type PipelineFunctionCall = { name: string; params: string[] };

export interface PipelineProcessOptions {
    skipFailedPipelineFunctions?: boolean;
    ignoreMissingPipelineFunctions?: boolean;
}

export function processPipeline(value: string, originalStringResource: StringResource, pipelineFunctionsMap: PipelineFunctionsMap, pipelineFunctionCalls: PipelineFunctionCall[] = [], options?: PipelineProcessOptions): string {
    const stringResourceValue = SR.getValue(originalStringResource);
    if(pipelineFunctionCalls.length === 0) return stringResourceValue;
    const stringResourceMetadata = SR.getMetadata(originalStringResource);

    const stringResourceContext = Object.freeze({
        value: stringResourceValue,
        metadata: stringResourceMetadata,
    });

    let currentValue = value;
    for(const pipelineFunctionCall of pipelineFunctionCalls) {
        const pipelineFunction = pipelineFunctionsMap[pipelineFunctionCall.name];
        if(!pipelineFunction) {
            if(options?.ignoreMissingPipelineFunctions) continue;
            else throw new Error(`Pipeline function '${pipelineFunctionCall.name}' not found`);
        }
        try {
            currentValue = pipelineFunction({
                value: currentValue,
                parameters: pipelineFunctionCall.params,
                stringResource: stringResourceContext,
            });
        }
        catch (err) {
            if(options?.skipFailedPipelineFunctions) continue;
            else throw err;
        }
    }
    return currentValue;
}