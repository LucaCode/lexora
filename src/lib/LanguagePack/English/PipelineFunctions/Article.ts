import { PipelineFunction } from "../../../PipelineFunction/PipelineFunction";

export const ArticlePipelineFunction: PipelineFunction = {
    name: "article",
    type: "value",
    phase: "transform",
    process: (context) => {
        const type = context.parameters?.[0]; // "definite" | "indefinite"

        const noun = String(context.value).trim();
        if (!noun) throw new Error("article: empty noun");
        
        const form = context.executionContext.form as Intl.LDMLPluralRule | "_" | undefined;
        const isPluralForm =
            form !== undefined &&
            form !== "_" &&
            form !== "one";

        if (type === "definite" || !type) {
            return `the ${noun}`;
        }

        if (type === "indefinite") {
            if (isPluralForm) {
                return noun;
            }

            const firstLetter = noun[0].toLowerCase();
            const vowels = ["a", "e", "i", "o", "u"];
            const article = vowels.includes(firstLetter) ? "an" : "a";

            return `${article} ${noun}`;
        }

        throw new Error(
            `article: invalid type (expected "definite" | "indefinite")`
        );
    }
};