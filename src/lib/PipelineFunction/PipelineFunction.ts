import { DynamicValue } from "../DynamicValue";
import { LanguageKey } from "../LanguageKey";

export interface PipelineProcessContext {
    value: DynamicValue;
    parameters: string[],
    language: LanguageKey;
    stringResource: {
        value: string;
        metadata: Record<string, any>;
    } | undefined;
}

export type PipelineProcessFunction = (context: PipelineProcessContext) => DynamicValue;

export interface PipelineFunction {
    name: string;
    process: PipelineProcessFunction;
}

export type PipelineFunctionsMap = Record<string, PipelineProcessFunction>;