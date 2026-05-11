import { PipelineFunction } from "../PipelineFunction";

export const CurrencyPipelineFunction: PipelineFunction = {
    name: "currency",
    type: "value",
    phase: "format",
    process: (context) => {
        const { value, parameters, language, formatAdapter } = context;

        if (value == null) return value;

        if (typeof value !== "number" && typeof value !== "bigint") {
            throw new Error("currency: value must be number or bigint");
        }

        const currency = parameters?.[0] ?? "EUR";

        const minimumFractionDigits =
            parameters?.[1] != null ? Number(parameters[1]) : undefined;

        const maximumFractionDigits =
            parameters?.[2] != null ? Number(parameters[2]) : undefined;

        return formatAdapter.formatCurrency(language, value, {
            currency,
            ...(minimumFractionDigits !== undefined && {
                minimumFractionDigits,
            }),
            ...(maximumFractionDigits !== undefined && {
                maximumFractionDigits,
            }),
        });
    },
};