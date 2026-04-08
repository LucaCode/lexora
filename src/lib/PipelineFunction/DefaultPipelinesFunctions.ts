import { CurrencyPipelineFunction } from "./Lib/CurrencyPipelineFunction";
import { DatePipelineFunction } from "./Lib/DatePipelineFunction";
import { NumberPipelineFunction } from "./Lib/NumberPipelineFunction";
import { StringUtilPipelineFunctions } from "./Lib/StringUtilPipelineFunctions";
import { TimePipelineFunction } from "./Lib/TimePipelineFunction";
import { PipelineFunction } from "./PipelineFunction";

export const DefaultPipelineFunctions: PipelineFunction[] = [
    ...Object.values(StringUtilPipelineFunctions),
    CurrencyPipelineFunction,
    DatePipelineFunction,
    TimePipelineFunction,
    NumberPipelineFunction
];