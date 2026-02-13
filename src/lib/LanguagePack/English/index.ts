import { LanguagePack } from "./../LanguagePack";
import { ArticlePipelineFunction } from "./PipelineFunctions/Article";
import {Features as EnglishFeatures} from "./Features";

export namespace EnglishLanguagePack {
  export import Features = EnglishFeatures;
  export const pack: LanguagePack = {
    language: "en",
    pipelineFunctions: [ArticlePipelineFunction],
  };
}
