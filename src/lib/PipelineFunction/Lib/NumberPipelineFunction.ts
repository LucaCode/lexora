import { PipelineFunction } from "../PipelineFunction";

export const NumberPipelineFunction: PipelineFunction = {
    name: "number",
    process: (context) => {
        const { value, parameters, language } = context;

        if (typeof value !== "number" && typeof value !== "bigint") {
            throw new Error("number: value must be number or bigint");
        }

        const fractionDigits =
            parameters?.[0] != null ? Number(parameters[0]) : undefined;

        return new Intl.NumberFormat(language, {
            ...(fractionDigits !== undefined && {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
            }),
        }).format(value);
    },
}