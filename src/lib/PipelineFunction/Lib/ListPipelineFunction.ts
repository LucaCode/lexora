import { SR } from "../../StringResource";
import { PipelineFunction } from "../PipelineFunction";

export const ListPipelineFunction: PipelineFunction = {
    name: "list",
    type: "array",
    process: (context) => {
        const { value, language, parameters } = context;
        if (value == null || SR.isStringResource(value) || !Array.isArray(value)) return value;

        let type: Intl.ListFormatType = "conjunction";
        let style: Intl.ListFormatStyle = "long";

        if (parameters?.length) {
            const [typeParam, styleParam] = parameters;
            if (typeParam) {
                if (typeParam === "or") type = "disjunction";
                else if (typeParam === "and") type = "conjunction";
                else if (typeParam === "disjunction") type = "disjunction";
                else if (typeParam === "conjunction") type = "conjunction";
            }
            if (styleParam) {
                if (["long", "short", "narrow"].includes(styleParam)) {
                    style = styleParam as Intl.ListFormatStyle;
                }
            }
        }

        return new Intl.ListFormat(language, {
            type,
            style,
        }).format(value.map(v => String(v)));
    },
};