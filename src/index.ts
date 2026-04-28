/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
 */

import "intl-list-format";
import "intl-list-format/locale-data/en";
import "intl-list-format/locale-data/de";

import { BoundTemplate, boundTemplate, isBoundTemplate } from "./lib/BoundTemplate";
import { LanguageKey } from "./lib/LanguageKey";
import { LanguagePacks } from "./lib/LanguagePack";
import { LanguagePack } from "./lib/LanguagePack/LanguagePack";
import { LexoraContext, TranslateCallContext } from "./lib/LexoraContext";
import { PipelineFunction } from "./lib/PipelineFunction/PipelineFunction";
import { StringResource, StringResourceMap, SR } from "./lib/StringResource";
import { WatchableString } from "./lib/WatchableString";
import { Template } from "./lib/Types";

export {
    LanguageKey,
    LanguagePack,
    LanguagePacks,
    LexoraContext,
    StringResource,
    StringResourceMap,
    PipelineFunction,
    WatchableString,
    TranslateCallContext,
    boundTemplate,
    isBoundTemplate,
    BoundTemplate,
    SR,
    Template
};