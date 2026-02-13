export interface PipelineProcessContext {
    value: string;
    parameters: string[],
    stringResource: {
        value: string;
        metadata: Record<string, any>;
    };
}

export type PipelineProcessFunction = (context: PipelineProcessContext) => string;

export interface PipelineFunction {
    name: string;
    process: PipelineProcessFunction;
}

export type PipelineFunctionsMap = Record<string, PipelineProcessFunction>;