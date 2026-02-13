import { LanguageKey } from "./LanguageKey";
import { LanguagePacks } from "./LanguagePack";
import { LanguagePack } from "./LanguagePack/LanguagePack";
import { DefaultPipelineFunctions } from "./PipelineFunction/DefaultPipelinesFunctions";
import { PipelineFunction, PipelineFunctionsMap } from "./PipelineFunction/PipelineFunction";
import { StringResource, StringResourceMap } from "./StringResource";
import EventEmitter from "emitix";
import { WatchableString } from "./WatchableString";
import { replacePlaceholdersFast } from "./Parser/PlaceholderParser";
import { processPipeline } from "./PipelineFunction/PipelineProcessor";

export type TranslateCallContext = Record<string, StringResourceMap | StringResource>;
type WatchableStringRef = WeakRef<WatchableString<LexoraContext>>;

interface LexoraContextOptions {
    ignoreMissingKeys?: boolean;
    defaultValueForMissingKeys?: string;
    skipFailedPipelineFunctions?: boolean;
    ignoreMissingPipelineFunctions?: boolean;
}

export class LexoraContext extends EventEmitter.Protected<{
    update: []
}> {
    private _options: LexoraContextOptions = {
        skipFailedPipelineFunctions: false,
        ignoreMissingKeys: true,
        ignoreMissingPipelineFunctions: false,
        defaultValueForMissingKeys: "?",
    };

    private _defaultPipelineFunctions: PipelineFunction[] = [];

    private _currentLanguage: LanguageKey = "en";
    private _currentPipelineFunctionsMap: PipelineFunctionsMap = {};

    private _languagePacks: Record<LanguageKey, LanguagePack> = {};
    private _stringResources: Record<LanguageKey, Record<string, StringResource>> = {};

    private _watchableStrings: Set<WatchableStringRef> = new Set();
    private _finalizeWatchableStrings = new FinalizationRegistry<WatchableStringRef>((ref) => {
        this._watchableStrings.delete(ref);
    });

    constructor(options?: LexoraContextOptions) {
        super();
        if (options) this._options = { ...this._options, ...options };

        this.on("update", () => {
            for (const ref of this._watchableStrings) {
                const w = ref.deref();
                if (!w) {
                    this._watchableStrings.delete(ref);
                    continue;
                }
                w._update(this);
            }
        });
    }

    private _trackWatchableString(w: WatchableString<LexoraContext>) {
        const ref = new WeakRef(w);
        this._watchableStrings.add(ref);
        this._finalizeWatchableStrings.register(w, ref);
    }

    public static createWithDefaults(options?: LexoraContextOptions): LexoraContext {
        const context = new LexoraContext(options);
        context.loadDefaultPipelineFunction(Object.values(DefaultPipelineFunctions));
        context.loadLanguagePack(Object.values(LanguagePacks).map(lp => lp.pack));
        return context;
    }

    /**
     * Loads default pipeline function or functions that are applied to all translations.
     * @param pipelineFunction 
     */
    loadDefaultPipelineFunction(pipelineFunction: PipelineFunction[] | PipelineFunction) {
        if (Array.isArray(pipelineFunction)) this._defaultPipelineFunctions.push(...pipelineFunction);
        else this._defaultPipelineFunctions.push(pipelineFunction);
        this._updateCurrentLanguagePipelineFunctions();
        this.emit("update");
    }

    /**
     * Loads a language pack or multiple language packs.
     * @param languagePack 
     */
    loadLanguagePack(languagePack: LanguagePack | LanguagePack[]) {
        if (Array.isArray(languagePack)) {
            languagePack.forEach(lp => {
                this._languagePacks[lp.language] = lp;
            });
        } else {
            this._languagePacks[languagePack.language] = languagePack;
        }
        this._updateCurrentLanguagePipelineFunctions();
        this.emit("update");
    }

    /**
     * Loads a map of string resources for a specific language.
     * @example 
     * Language: "en"
     * {
     *  "greeting": "Hello",
     *  "farewell": "Goodbye",
     *  //Substring resource map
     *  "gameCategory.adventure": "Adventure",
     * }
     * @param language 
     * @param map 
     */
    loadLanguageStringResources(language: LanguageKey, map: Record<string, StringResource>) {
        this._stringResources[language] = { ...this._stringResources[language], ...map };
        this.emit("update");
    }

    /**
     * Loads a map of string resource translations for a specific key.
     * @example
     * Key: "gameCategory.adventure"
     * {
     *  "en": "Adventure",
     *  "de": "Abenteur",
     * }
     * @param key 
     * @param map 
     */
    loadStringResourceTranslations(key: string, map: StringResourceMap) {
        for (const language in map) {
            this._stringResources[language] = { ...this._stringResources[language], [key]: map[language] };
        }
        this.emit("update");
    }

    /**
     * Loads multiple string resource translations for multiple keys and languages.
     * @example
     * {
     *  "gameCategory.adventure": {
     *      "en": "Adventure",
     *      "de": "Abenteur",
     *  },
     *  "gameCategory.horror": {
     *      "en": "Horror",
     *      "de": "Horror",
     *  },
     * }
     * @param resources 
     */
    loadMultipleStringResourceTranslations(resources: Record<string, StringResourceMap>) {
        for (const key in resources) {
            const map = resources[key];
            for (const language in map) {
                this._stringResources[language] = { ...this._stringResources[language], [key]: map[language] };
            }
        }
        this.emit("update");
    }

    /**
     * Set the current language.
     */
    set language(language: LanguageKey) {
        const oldLanguage = this._currentLanguage;
        this._currentLanguage = language;
        if (oldLanguage !== language) {
            this._updateCurrentLanguagePipelineFunctions();
            this.emit("update");
        }
    }

    private _updateCurrentLanguagePipelineFunctions() {
        const currentPipelineFunctionsMap: PipelineFunctionsMap = {};

        for (const defaultPipelineFunction of this._defaultPipelineFunctions)
            currentPipelineFunctionsMap[defaultPipelineFunction.name] = defaultPipelineFunction.process;

        const languagePack = this._languagePacks[this._currentLanguage];
        if (languagePack) {
            for (const pipelineFunction of languagePack.pipelineFunctions) {
                currentPipelineFunctionsMap[pipelineFunction.name] = pipelineFunction.process;
            }
        }

        this._currentPipelineFunctionsMap = currentPipelineFunctionsMap;
    }

    private _processStringResource(
        stringResource: StringResource,
        callContext: TranslateCallContext,
        callPath: string[]
    ): string {
        const stringResourceValue = typeof stringResource === "string" ? stringResource : stringResource[0];
        if (stringResourceValue.indexOf("{{") === -1) return stringResourceValue;

        const languageStringResources = this._stringResources[this._currentLanguage] ?? {};
        return replacePlaceholdersFast(stringResourceValue, (key, pipelines) => {
            if (callPath.includes(key)) throw new Error(`Circular reference detected for key '${key}' in call path '${[...callPath, key].join("->")}'`);

            let resStringResource = this._resolveKeyFromCallContext(key, callContext) ?? languageStringResources[key];
            if (resStringResource == null) {
                if (this._options.ignoreMissingKeys) return this._options.defaultValueForMissingKeys ?? "?";
                else throw new Error(`Can not resolve key '${key}' with language '${this._currentLanguage}'`);
            }

            const processedValue = this._processStringResource(resStringResource, callContext, [...callPath, key]);

            if (pipelines.length === 0) return processedValue;
            return processPipeline(processedValue, resStringResource, this._currentPipelineFunctionsMap, pipelines, this._options);
        });
    }

    private _resolveKeyFromCallContext(key: string, context: TranslateCallContext): StringResource | null {
        const value = context[key];
        if(value == null) return null;
        if(typeof value === "string" || Array.isArray(value)) return value;
        return (value as StringResourceMap)[this._currentLanguage];
    }

    get(key: string, context: TranslateCallContext = {}): string {
        const languageStringResources = this._stringResources[this._currentLanguage] ?? {};
        let resource = languageStringResources[key];
        if (resource == null) {
            if (this._options.ignoreMissingKeys) return this._options.defaultValueForMissingKeys ?? "?";
            else throw new Error(`Can not resolve key '${key}' with language '${this._currentLanguage}'`);
        }
        return this._processStringResource(resource, context, [key]);
    }

    getWatch(key: string, context: TranslateCallContext = {}): WatchableString<LexoraContext> {
        const callContext = { ...context };
        const run = (context: LexoraContext) => context.get(key, callContext);
        const watchableString = new WatchableString(run(this), run);
        this._trackWatchableString(watchableString);
        return watchableString;
    }

    translate(template: StringResourceMap | string, context: TranslateCallContext = {}): string {
        let stringResource: StringResource;
        if (typeof template === "object") {
            stringResource = template[this._currentLanguage];
            if (stringResource == null) {
                if (this._options.ignoreMissingKeys) return this._options.defaultValueForMissingKeys ?? "?";
                else throw new Error(`Can not resolve template for language '${this._currentLanguage}'`);
            }
        }
        else stringResource = template;
        return this._processStringResource(stringResource, context, ["[template]"]);
    }

    translateWatch(template: StringResourceMap | string, context: TranslateCallContext = {}): WatchableString<LexoraContext> {
        const callContext = { ...context };
        const clonedTemplate = typeof template === "string" ? template : { ...template };
        const run = (context: LexoraContext) => context.translate(clonedTemplate, callContext);
        const watchableString = new WatchableString(run(this), run);
        this._trackWatchableString(watchableString);
        return watchableString;
    }

}