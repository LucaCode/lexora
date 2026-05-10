import { SR, StringResource } from "../../../..";
import { PipelineFunction } from "../../../PipelineFunction/PipelineFunction";
import { Features } from "../Features";

export enum DeGrammaticalCase {
    Nominative = "nominative",
    Accusative = "accusative",
    Dative = "dative",
    Genitive = "genitive",
}

function isDeGrammaticalCase(x: string): x is DeGrammaticalCase {
    return (
        x === DeGrammaticalCase.Nominative ||
        x === DeGrammaticalCase.Accusative ||
        x === DeGrammaticalCase.Dative ||
        x === DeGrammaticalCase.Genitive
    );
}

const DEFINITE_ARTICLES: Record<
    DeGrammaticalCase,
    Record<Features.GrammaticalGender, string>
> = {
    [DeGrammaticalCase.Nominative]: {
        [Features.GrammaticalGender.Masculine]: "der",
        [Features.GrammaticalGender.Feminine]: "die",
        [Features.GrammaticalGender.Neuter]: "das",
    },
    [DeGrammaticalCase.Accusative]: {
        [Features.GrammaticalGender.Masculine]: "den",
        [Features.GrammaticalGender.Feminine]: "die",
        [Features.GrammaticalGender.Neuter]: "das",
    },
    [DeGrammaticalCase.Dative]: {
        [Features.GrammaticalGender.Masculine]: "dem",
        [Features.GrammaticalGender.Feminine]: "der",
        [Features.GrammaticalGender.Neuter]: "dem",
    },
    [DeGrammaticalCase.Genitive]: {
        [Features.GrammaticalGender.Masculine]: "des",
        [Features.GrammaticalGender.Feminine]: "der",
        [Features.GrammaticalGender.Neuter]: "des",
    },
};

const DEFINITE_PLURAL_ARTICLES: Record<DeGrammaticalCase, string> = {
    [DeGrammaticalCase.Nominative]: "die",
    [DeGrammaticalCase.Accusative]: "die",
    [DeGrammaticalCase.Dative]: "den",
    [DeGrammaticalCase.Genitive]: "der",
};

export const ArticlePipelineFunction: PipelineFunction = {
    name: "article",
    type: "value",
    phase: "transform",
    process: (context) => {
        const grammaticalCaseRaw = context.parameters?.[0];

        if (!grammaticalCaseRaw) {
            throw new Error(
                `article: missing parameter[0] grammatical case (expected one of: ${Object.values(
                    DeGrammaticalCase
                ).join(", ")})`
            );
        }

        if (!isDeGrammaticalCase(grammaticalCaseRaw)) {
            throw new Error(
                `article: invalid grammatical case "${grammaticalCaseRaw}" (expected one of: ${Object.values(
                    DeGrammaticalCase
                ).join(", ")})`
            );
        }

        const stringResource = context.stringResource;
        if(!stringResource) throw new Error(`article: can not determine gender without stringResource`);
        const metadata = SR.getMetadata(stringResource as StringResource);

        const form = context.executionContext.form as Intl.LDMLPluralRule | "_" | undefined;
        const isPluralForm =
            form !== undefined &&
            form !== "_" &&
            form !== "one";

        const article = isPluralForm
            ? DEFINITE_PLURAL_ARTICLES[grammaticalCaseRaw]
            : (() => {
                  const gender = metadata.gender as
                      | Features.GrammaticalGender
                      | undefined;

                  if (
                      gender !== Features.GrammaticalGender.Masculine &&
                      gender !== Features.GrammaticalGender.Feminine &&
                      gender !== Features.GrammaticalGender.Neuter
                  ) {
                      throw new Error(
                          `article: missing/invalid gender in stringResource.metadata.gender (expected: "${Features.GrammaticalGender.Masculine}" | "${Features.GrammaticalGender.Feminine}" | "${Features.GrammaticalGender.Neuter}")`
                      );
                  }

                  return DEFINITE_ARTICLES[grammaticalCaseRaw][gender];
              })();

        const noun = String(context.value ?? "");

        if (!noun.trim()) throw new Error(`article: empty noun value in context`);

        return `${article} ${noun}`;
    },
};