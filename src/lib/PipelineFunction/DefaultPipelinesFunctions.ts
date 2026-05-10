import { ListPipelineFunction } from "./Lib/ListPipelineFunction";
import { CurrencyPipelineFunction } from "./Lib/CurrencyPipelineFunction";
import { DatePipelineFunction } from "./Lib/DatePipelineFunction";
import { NumberPipelineFunction } from "./Lib/NumberPipelineFunction";
import { StringUtilPipelineFunctions } from "./Lib/StringUtilPipelineFunctions";
import { TimePipelineFunction } from "./Lib/TimePipelineFunction";
import { PipelineFunction } from "./PipelineFunction";
import { FormPipelineFunction } from "./Lib/FormPipelineFunction";
import { SwitchPipelineFunction } from "./Lib/SwitchPipelineFunction";

export const DefaultPipelineFunctions: PipelineFunction[] = [
    ...Object.values(StringUtilPipelineFunctions),
    CurrencyPipelineFunction,
    DatePipelineFunction,
    TimePipelineFunction,
    NumberPipelineFunction,
    ListPipelineFunction,
    FormPipelineFunction,
    SwitchPipelineFunction
];