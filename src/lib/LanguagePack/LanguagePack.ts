import { LanguageKey } from "../LanguageKey";
import { PipelineFunction } from "../PipelineFunction/PipelineFunction";

export interface LanguagePack {
    language: LanguageKey,
    pipelineFunctions: PipelineFunction[];
}