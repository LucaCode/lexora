import { PipelineFunction } from "./PipelineFunction";

export const DefaultPipelineFunctions: Record<string, PipelineFunction> = {
    upper: {
        name: "upper",
        process: (context) => {
            return context.value.toUpperCase();
        }
    },

    lower: {
        name: "lower",
        process: (context) => {
            return context.value.toLowerCase();
        }
    },

    capitalize: {
        name: "capitalize",
        process: (context) => {
            if (!context.value) return context.value;
            return context.value.charAt(0).toUpperCase() + context.value.slice(1);
        }
    },

    trim: {
        name: "trim",
        process: (context) => {
            return context.value.trim();
        }
    },

    prefix: {
        name: "prefix",
        process: (context) => {
            const prefix = context.parameters?.[0] ?? "";
            return prefix + context.value;
        }
    },

    suffix: {
        name: "suffix",
        process: (context) => {
            const suffix = context.parameters?.[0] ?? "";
            return context.value + suffix;
        }
    },

};