import { LanguagePack } from "./../LanguagePack";
import { ArticlePipelineFunction } from "./PipelineFunctions/Article";
import {Features as GermanFeautures} from "./Features";

export namespace GermanLanguagePack {
  export import Features = GermanFeautures;
  export const pack: LanguagePack = {
    language: "de",
    pipelineFunctions: [ArticlePipelineFunction],
  };
}
