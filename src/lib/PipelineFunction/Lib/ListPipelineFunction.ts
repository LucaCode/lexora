import { ListFormatStyle, ListFormatType } from "../../FormatAdapter/FormatAdapter";
import { SR } from "../../StringResource";
import { PipelineFunction } from "../PipelineFunction";

export const ListPipelineFunction: PipelineFunction = {
    name: "list",
    type: "array",
    process: (context) => {
        const { value, language, parameters, formatAdapter } = context;
        if (value == null || SR.isStringResource(value) || !Array.isArray(value)) return value;

        let type: ListFormatType = "conjunction";
        let style: ListFormatStyle = "long";

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
                    style = styleParam as ListFormatStyle;
                }
            }
        }

        return formatAdapter.formatList(language, value.map(v => String(v)), {
            type,
            style,
        });
    },
};