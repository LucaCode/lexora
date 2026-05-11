import { PipelineFunction } from "../PipelineFunction";

export const NumberPipelineFunction: PipelineFunction = {
    name: "number",
    type: "value",
    phase: "format",
    process: (context) => {
        const { value, parameters, language, formatAdapter } = context;

        if (typeof value !== "number" && typeof value !== "bigint") {
            throw new Error("number: value must be number or bigint");
        }

        const fractionDigits =
            parameters?.[0] != null ? Number(parameters[0]) : undefined;

        return formatAdapter.formatNumber(language, value, {
            ...(fractionDigits !== undefined && {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
            }),
        });
    },
}