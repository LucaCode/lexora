import { PipelineFunction } from "../PipelineFunction";

export const StringUtilPipelineFunctions: Record<string, PipelineFunction> = {
    upper: {
        name: "upper",
        process: (context) => {
            return String(context.value).toUpperCase();
        }
    },

    lower: {
        name: "lower",
        process: (context) => {
            return String(context.value).toLowerCase();
        }
    },

    capitalize: {
        name: "capitalize",
        process: (context) => {
            if (!context.value) return context.value;
            const str = String(context.value);
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    },

    trim: {
        name: "trim",
        process: (context) => {
            return String(context.value).trim();
        }
    },

    prefix: {
        name: "prefix",
        process: (context) => {
            const prefix = context.parameters?.[0] ?? "";
            return prefix + String(context.value);
        }
    },

    suffix: {
        name: "suffix",
        process: (context) => {
            const suffix = context.parameters?.[0] ?? "";
            return String(context.value) + suffix;
        }
    },
};