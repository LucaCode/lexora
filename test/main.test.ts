/*
Author: Ing. Luca Gian Scaringella
GitHub: LucaCode
Copyright(c) Ing. Luca Gian Scaringella
*/

const assert = require("chai").assert;
import { LexoraContext, StringResourceMap, LanguagePacks } from "../src";

const { GrammaticalGender: DeGender } = LanguagePacks.German.Features;

const sampleData: Record<string, StringResourceMap> = {
    house: { en: "house", de: ["Haus", { gender: DeGender.Neuter }] },
    car: { en: "car", de: ["Auto", { gender: DeGender.Neuter }] },
    tree: { en: "tree", de: ["Baum", { gender: DeGender.Masculine }] },
    flower: { en: "flower", de: ["Blume", { gender: DeGender.Feminine }] },
    game: { en: "game", de: ["Spiel", { gender: DeGender.Neuter }] },
    apple: { en: "apple", de: ["Apfel", { gender: DeGender.Masculine }] },

    "gameCategory.horror": { en: "horror", de: "Horror" },
    "gameCategory.sports": { en: "sports", de: "Sport" },
    "gameCategory.strategy": { en: "strategy", de: "Strategie" },

    "tpl.simple": {
        en: "Hello {{house}}",
        de: "Hallo {{house}}",
    },
    "tpl.pipelineOnce": {
        en: "{{house->article(definite)}}",
        de: "{{house->article(nominative)}}",
    },
    "tpl.pipelineChain": {
        en: "{{tree->article(indefinite)->upper}}",
        de: "{{tree->article(dative)->upper}}",
    },
    "tpl.multiple": {
        en: "{{house}}, {{car}}, {{tree}}",
        de: "{{house}}, {{car}}, {{tree}}",
    },

    // dedicated templates for default pipeline tests
    "tpl.default.upper": { en: "{{house->upper}}", de: "{{house->upper}}" },
    "tpl.default.lower": { en: "{{house->lower}}", de: "{{house->lower}}" },
    "tpl.default.trim": { en: "{{spacey->trim}}", de: "{{spacey->trim}}" },
    spacey: { en: "  House  ", de: "  Haus  " },
};

function makeStrictCtx() {
    const ctx = LexoraContext.createWithDefaults({
        ignoreMissingKeys: false,
        skipFailedPipelineFunctions: false,
        ignoreMissingPipelineFunctions: false,
    });
    ctx.loadMultipleStringResourceTranslations(sampleData);
    return ctx;
}

function makeLenientCtx() {
    const ctx = LexoraContext.createWithDefaults({
        ignoreMissingKeys: true,
        defaultValueForMissingKeys: "?",
        skipFailedPipelineFunctions: true,
        ignoreMissingPipelineFunctions: true,
    });
    ctx.loadMultipleStringResourceTranslations(sampleData);
    return ctx;
}

describe("Template translation and pipeline processing", () => {

    describe("Basic placeholder replacement", () => {

        it("should replace {{key}} based on current language (de)", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            assert.equal(ctx.translate("{{house}}"), "Haus");
        });

        it("should replace {{key}} based on current language (en)", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";
            assert.equal(ctx.translate("{{house}}"), "house");
        });

        it("should replace multiple placeholders in one template", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            assert.equal(
                ctx.translate("{{house}}, {{car}}, {{tree}}"),
                "Haus, Auto, Baum"
            );
        });

    });

    describe("Pipeline execution", () => {

        it("should apply German article(nominative) using gender metadata", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            assert.equal(
                ctx.translate("{{house->article(nominative)}}"),
                "das Haus"
            );
        });

        it("should apply multiple pipelines sequentially", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            assert.equal(
                ctx.translate("{{tree->article(dative)->upper}}"),
                "DEM BAUM"
            );
        });

        it("should apply English indefinite article correctly (a/an)", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";
            assert.equal(ctx.translate("{{house->article(indefinite)}}"), "a house");
            assert.equal(ctx.translate("{{car->article(indefinite)}}"), "a car");
        });

        it("should support chained pipelines", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            assert.equal(
                ctx.translate("{{flower->article(nominative)->upper}}"),
                "DIE BLUME"
            );
        });

    });

    describe("Template keys containing placeholders", () => {

        it("should resolve nested placeholders from resource keys", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            assert.equal(ctx.get("tpl.simple"), "Hallo Haus");
        });

        it("should resolve resource template with pipeline", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            assert.equal(ctx.get("tpl.pipelineOnce"), "das Haus");
        });

        it("should resolve resource template with multiple placeholders", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";
            assert.equal(ctx.get("tpl.multiple"), "house, car, tree");
        });

    });

    describe("Error handling (strict vs lenient mode)", () => {

        it("should throw on missing key in strict mode", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            assert.throws(() => ctx.translate("{{doesNotExist}}"));
        });

        it("should return default value for missing key in lenient mode", () => {
            const ctx = makeLenientCtx();
            ctx.language = "de";
            assert.equal(ctx.translate("{{doesNotExist}}"), "?");
        });

        it("should throw on unknown pipeline in strict mode", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            assert.throws(() => ctx.translate("{{house->doesNotExist()}}"));
        });

        it("should ignore unknown pipeline in lenient mode", () => {
            const ctx = makeLenientCtx();
            ctx.language = "de";
            assert.equal(ctx.translate("{{house->doesNotExist()}}"), "Haus");
        });

        it("should throw when required pipeline parameters are missing in strict mode", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            assert.throws(() => ctx.translate("{{house->article()}}"));
        });

        it("should skip failed pipeline execution in lenient mode", () => {
            const ctx = makeLenientCtx();
            ctx.language = "de";
            assert.equal(ctx.translate("{{house->article()}}"), "Haus");
        });

    });

    describe("Call context overrides", () => {

        it("should override resource value using call context", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            const out = ctx.translate("{{house}}", {
                house: { de: "Villa", en: "villa" },
            });
            assert.equal(out, "Villa");
        });

        it("should apply article pipeline when context override includes metadata", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";

            const out = ctx.translate("{{house->article(nominative)}}", {
                house: ["Villa", { gender: DeGender.Feminine }],
            });

            assert.equal(out, "die Villa");
        });

        it("should apply string resource from call context", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";

            const out = ctx.translate("{{gameCategory}}", {
                gameCategory: "{{gameCategory.sports}}",
            });

            assert.equal(out, "Sport");
        });

    });

    describe("Default pipeline functions", () => {
        it("should apply uppercase as a default pipeline in English", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";
            assert.equal(ctx.get("tpl.default.upper"), "HOUSE");
        });

        it("should apply uppercase as a default pipeline in German", () => {
            const ctx = makeStrictCtx();
            ctx.language = "de";
            assert.equal(ctx.get("tpl.default.upper"), "HAUS");
        });

        it("should apply lowercase as a default pipeline in English", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";
            assert.equal(ctx.get("tpl.default.lower"), "house");
        });

        it("should apply trim as a default pipeline in both languages", () => {
            const ctx = makeStrictCtx();

            ctx.language = "en";
            assert.equal(ctx.get("tpl.default.trim"), "House");

            ctx.language = "de";
            assert.equal(ctx.get("tpl.default.trim"), "Haus");
        });

        describe("Additional default pipeline functions", () => {

            describe("capitalize", () => {

                it("should capitalize first character in English", () => {
                    const ctx = makeStrictCtx();
                    ctx.language = "en";
                    assert.equal(
                        ctx.translate("{{house->capitalize}}"),
                        "House"
                    );
                });

                it("should capitalize first character in German", () => {
                    const ctx = makeStrictCtx();
                    ctx.language = "de";
                    assert.equal(
                        ctx.translate("{{flower->capitalize}}"),
                        "Blume"
                    );
                });

                it("should not fail on empty value", () => {
                    const ctx = makeStrictCtx();
                    ctx.loadMultipleStringResourceTranslations({
                        empty: { en: "", de: "" },
                    });

                    ctx.language = "en";
                    assert.equal(
                        ctx.translate("{{empty->capitalize}}"),
                        ""
                    );
                });

            });

            describe("prefix", () => {

                it("should add prefix to value", () => {
                    const ctx = makeStrictCtx();
                    ctx.language = "en";
                    assert.equal(
                        ctx.translate("{{house->prefix('My ')}}"),
                        "My house"
                    );
                });

                it("should add prefix in German", () => {
                    const ctx = makeStrictCtx();
                    ctx.language = "de";
                    assert.equal(
                        ctx.translate("{{house->prefix('Mein ')}}"),
                        "Mein Haus"
                    );
                });

                it("should support chaining with prefix", () => {
                    const ctx = makeStrictCtx();
                    ctx.language = "en";
                    assert.equal(
                        ctx.translate("{{house->prefix('big ')->capitalize}}"),
                        "Big house"
                    );
                });

            });

            describe("suffix", () => {

                it("should add suffix to value", () => {
                    const ctx = makeStrictCtx();
                    ctx.language = "en";
                    assert.equal(
                        ctx.translate("{{house->suffix(!)}}"),
                        "house!"
                    );
                });

                it("should add suffix in German", () => {
                    const ctx = makeStrictCtx();
                    ctx.language = "de";
                    assert.equal(
                        ctx.translate("{{flower->suffix(!)}}"),
                        "Blume!"
                    );
                });

                it("should add suffix in German", () => {
                    const ctx = makeStrictCtx();
                    ctx.language = "de";
                    assert.equal(
                        ctx.translate("{{flower->suffix(' (2x)')}}"),
                        "Blume (2x)"
                    );
                });

                it("should support chaining with suffix and uppercase", () => {
                    const ctx = makeStrictCtx();
                    ctx.language = "en";
                    assert.equal(
                        ctx.translate("{{house->suffix(!)->upper}}"),
                        "HOUSE!"
                    );
                });

            });

            describe("prefix and suffix combined", () => {

                it("should combine prefix and suffix in correct order", () => {
                    const ctx = makeStrictCtx();
                    ctx.language = "en";
                    assert.equal(
                        ctx.translate("{{house->prefix('My ')->suffix(!)}}"),
                        "My house!"
                    );
                });

            });

        });

    });

    describe("WatchableString", () => {
        it("should emit update when language changes and value changes", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";

            const w = ctx.getWatch("house");

            const updates: string[] = [];
            const errors: Error[] = [];

            w.on("update", (v) => updates.push(v));
            w.on("error", (e) => errors.push(e));

            assert.equal(w.value, "house");

            ctx.language = "de";

            assert.equal(errors.length, 0);
            assert.deepEqual(updates, ["Haus"]);
            assert.equal(w.value, "Haus");
        });

        it("should not emit update when language changes but value stays identical", () => {
            const ctx = makeStrictCtx();

            ctx.loadMultipleStringResourceTranslations({
                same: { en: "SAME", de: "SAME" },
            });

            ctx.language = "en";
            const w = ctx.getWatch("same");

            const updates: string[] = [];
            w.on("update", (v) => updates.push(v));

            ctx.language = "de";

            assert.deepEqual(updates, []);
            assert.equal(w.value, "SAME");
        });

        it("should emit update for translateWatch templates when language changes", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";

            const w = ctx.translateWatch("X: {{flower}}");

            const updates: string[] = [];
            w.on("update", (v) => updates.push(v));

            assert.equal(w.value, "X: flower");

            ctx.language = "de";

            assert.deepEqual(updates, ["X: Blume"]);
            assert.equal(w.value, "X: Blume");
        });
    });

    describe("English article pipeline", () => {

        it("should use definite article by default when parameter is missing", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";
            assert.equal(ctx.translate("{{house->article}}"), "the house");
        });

        it("should use definite article when type is 'definite'", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";
            assert.equal(ctx.translate("{{house->article(definite)}}"), "the house");
        });

        it("should use indefinite article 'a' for consonant-starting nouns", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";
            assert.equal(ctx.translate("{{house->article(indefinite)}}"), "a house");
        });

        it("should use indefinite article 'an' for vowel-starting nouns", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";
            assert.equal(ctx.translate("{{apple->article(indefinite)}}"), "an apple");
        });

        it("should throw on invalid article type in strict mode", () => {
            const ctx = makeStrictCtx();
            ctx.language = "en";
            assert.throws(() => ctx.translate("{{house->article(foo)}}"));
        });

        it("should skip failed article pipeline in lenient mode and keep original value", () => {
            const ctx = makeLenientCtx();
            ctx.language = "en";
            assert.equal(ctx.translate("{{house->article(foo)}}"), "house");
        });

    });

});