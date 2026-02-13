
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

export const ArticlePipelineFunction: PipelineFunction = {
    name: "article",
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

        const gender = context.stringResource?.metadata?.gender as
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

        const article = DEFINITE_ARTICLES[grammaticalCaseRaw][gender];
        const noun = context.value ?? context.stringResource?.value ?? "";

        if (!noun.trim()) throw new Error(`article: empty noun value in context`);
        return `${article} ${noun}`;
    },
};