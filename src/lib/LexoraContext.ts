import { LanguageKey } from "./LanguageKey";
import { LanguagePacks } from "./LanguagePack";
import { LanguagePack } from "./LanguagePack/LanguagePack";
import { DefaultPipelineFunctions } from "./PipelineFunction/DefaultPipelinesFunctions";
import { PipelineFunction, PipelineFunctionsMap } from "./PipelineFunction/PipelineFunction";
import { SR, StringResource, StringResourceMap } from "./StringResource";
import EventEmitter from "emitix";
import { WatchableString } from "./WatchableString";
import { replacePlaceholdersFast } from "./Parser/PlaceholderParser";
import { PipelineFunctionCall, processPipeline, resolvePipelineFunctionCalls } from "./PipelineFunction/PipelineProcessor";
import { DynamicValue, FormattableResource } from "./DynamicValue";
import { formatFormattableResourceDefault } from "./DefaultFormatter";
import { BoundTemplate, isBoundTemplate } from "./BoundTemplate";
import { SingleOrArray, Template } from "./Types";

export type TranslateCallContext = Record<string, DynamicValue | undefined>;
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

    private _finalizeWatchableStrings =
        typeof FinalizationRegistry !== "undefined"
            ? new FinalizationRegistry<WatchableStringRef>((ref) => {
                this._watchableStrings.delete(ref);
            })
            : null;

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
        this._finalizeWatchableStrings?.register(w, ref);
    }

    /**
     * @description
     * Untracks a watchable string, so it won't receive updates anymore. 
     * This is useful to prevent memory leaks when a watchable string is no longer needed.
     * Notice normaly you don't need to call this method, because the context will automatically 
     * untrack watchable strings when they are garbage collected.
     * @param w 
     */
    untrackWatchableString(w: WatchableString<LexoraContext>) {
        for (const ref of this._watchableStrings) {
            const deref = ref.deref();
            if (deref === w) {
                this._watchableStrings.delete(ref);
                this._finalizeWatchableStrings?.unregister(w);
                break;
            }
        }
    }

    public static createWithDefaults(options?: LexoraContextOptions): LexoraContext {
        const context = new LexoraContext(options);
        context.loadDefaultPipelineFunction(DefaultPipelineFunctions);
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
            currentPipelineFunctionsMap[defaultPipelineFunction.name] = defaultPipelineFunction;

        const languagePack = this._languagePacks[this._currentLanguage];
        if (languagePack) {
            for (const pipelineFunction of languagePack.pipelineFunctions) {
                currentPipelineFunctionsMap[pipelineFunction.name] = pipelineFunction;
            }
        }

        this._currentPipelineFunctionsMap = currentPipelineFunctionsMap;
    }

    private _processStringResource(
        stringResource: StringResource,
        callContext: TranslateCallContext,
        callPath: string[]
    ): string {
        const stringResourceValue = SR.getValue(stringResource);
        if (stringResourceValue.indexOf("{{") === -1) return stringResourceValue;

        const languageStringResources = this._stringResources[this._currentLanguage] ?? {};
        return replacePlaceholdersFast(stringResourceValue, (key, pipelines) => {
            if (callPath.includes(key)) throw new Error(`Circular reference detected for key '${key}' in call path '${[...callPath, key].join("->")}'`);

            let value = this._resolveKeyFromCallContext(key, callContext) ?? languageStringResources[key];
            if (value == null) {
                if (this._options.ignoreMissingKeys) return this._options.defaultValueForMissingKeys ?? "?";
                else throw new Error(`Can not resolve key '${key}' with language '${this._currentLanguage}'`);
            }

            const pipelineFunctionCalls = resolvePipelineFunctionCalls(pipelines, this._currentPipelineFunctionsMap, 
                this._options.ignoreMissingPipelineFunctions);
            const valuePipelineFunctionCalls = pipelineFunctionCalls.filter(call => call.pipeline.type === "value");

            if(!SR.isStringResource(value) && Array.isArray(value)) {
                const arrayPipelineFunctionCalls = pipelineFunctionCalls.filter(call => call.pipeline.type === "array");
                const values = value.map(v => this._processValue(key, v, callContext, valuePipelineFunctionCalls, callPath));
                if (pipelines.length === 0) return values.join(" ");
                else return processPipeline(values, undefined, this._currentLanguage,arrayPipelineFunctionCalls, this._options);
            }
            else return this._processValue(key, value, callContext, valuePipelineFunctionCalls, callPath);
        });
    }

    private _processValue(key: string, value: StringResource | FormattableResource, 
        callContext: TranslateCallContext, pipelines: PipelineFunctionCall[], callPath: string[]): string 
    {
        let originalStringResource: StringResource | undefined = undefined;
        if (SR.isStringResource(value)) {
            originalStringResource = value;
            value = this._processStringResource(value, callContext, [...callPath, key]);
            if (pipelines.length === 0) return value;
        }
        else if (pipelines.length === 0)
            return formatFormattableResourceDefault(value, this._currentLanguage);

        return processPipeline(value, originalStringResource, this._currentLanguage, pipelines, this._options);
    }

    private _resolveKeyFromCallContext(key: string, context: TranslateCallContext): SingleOrArray<StringResource | FormattableResource> | undefined {
        const value = context[key];
        if (value == null) return undefined;
        if (Array.isArray(value) && !SR.isStringResource(value)) return value.map(v => this._resolveStringResourceMaps(v));
        else return this._resolveStringResourceMaps(value);
    }

    private _resolveStringResourceMaps(value: (StringResource | StringResourceMap | FormattableResource)): StringResource | FormattableResource {
        if (!Array.isArray(value) && typeof value === "object" && !(value instanceof Date))
            return (value as StringResourceMap)[this._currentLanguage];
        else return value;
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

    translate(template: BoundTemplate): string
    translate(template: StringResource | StringResourceMap | string, context?: TranslateCallContext): string
    translate(value: Template, context: TranslateCallContext = {}): string {
        if (isBoundTemplate(value)) return this.translate(value.template, { ...value.context, ...context });

        let stringResource: StringResource;
        if (typeof value === "object") {
            stringResource = value[this._currentLanguage];
            if (stringResource == null) {
                if (this._options.ignoreMissingKeys) return this._options.defaultValueForMissingKeys ?? "?";
                else throw new Error(`Can not resolve template for language '${this._currentLanguage}'`);
            }
        }
        else stringResource = value;
        return this._processStringResource(stringResource, context, ["[template]"]);
    }

    translateWatch(template: BoundTemplate): WatchableString<LexoraContext>
    translateWatch(template: StringResource | StringResourceMap | string, context?: TranslateCallContext): WatchableString<LexoraContext>
    translateWatch(value: Template, context: TranslateCallContext = {}): WatchableString<LexoraContext> {
        if (isBoundTemplate(value)) return this.translateWatch(value.template, { ...value.context, ...context });

        const callContext = { ...context };
        const clonedTemplate = typeof value === "string" ? value : { ...value };
        const run = (context: LexoraContext) => context.translate(clonedTemplate, callContext);
        let watchableString
        watchableString = new WatchableString(run(this), run, () =>
            this.untrackWatchableString(watchableString)
        );
        this._trackWatchableString(watchableString);
        return watchableString;
    }

}