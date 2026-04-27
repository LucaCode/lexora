
import { PipelineFunction } from "../../../PipelineFunction/PipelineFunction";

export const ArticlePipelineFunction: PipelineFunction = {
    name: "article",
    type: "value",
    process: (context) => {
        const type = context.parameters?.[0]; // "definite" | "indefinite"
        if(context.value == null) throw new Error("article: empty noun");
        const noun = String(context.value).trim();

        if (type === "definite" || !type) {
            return `the ${noun}`;
        }
        if (type === "indefinite") {
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
