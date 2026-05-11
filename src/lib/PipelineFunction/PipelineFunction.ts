import { DynamicValue } from "../DynamicValue";
import { FormatAdapter } from "../FormatAdapter/FormatAdapter";
import { LanguageKey } from "../LanguageKey";
import { TranslateCallContext } from "../LexoraContext";
import { StringResource } from "../StringResource";

export interface PipelineProcessContext {
    /**
     * @description
     * The current value being processed in the pipeline.
     *  This value can be transformed by each pipeline function and is passed to the next function in the pipeline.
     */
    value: DynamicValue;
    parameters: string[];
    language: LanguageKey;
    /**
     * @description
     * The original string resource that is being processed, if available.
     *  This can be useful for pipeline functions that need access to the metadata of the original string resource.
     */
    stringResource: Readonly<StringResource> | undefined;
    callContext: Readonly<TranslateCallContext>
    /**
     * @description
     * A context object that can be used to store and share data between pipeline 
     * functions during the processing of a single translation call.
     */
    executionContext: Record<string, any>;
    formatAdapter: FormatAdapter;   
}

export type PipelineProcessFunction =
    (context: PipelineProcessContext) => DynamicValue;

interface BasePipelineFunction {
    name: string;
    process: PipelineProcessFunction;
}

export interface ValuePipelineFunction
    extends BasePipelineFunction {
    type: "value";
    phase: "select" | "transform" | "format";
}

export interface ArrayPipelineFunction
    extends BasePipelineFunction {
    type: "array";
}

export type PipelineFunction =
    | ValuePipelineFunction
    | ArrayPipelineFunction;

export type PipelineFunctionsMap =
    Record<string, PipelineFunction>;