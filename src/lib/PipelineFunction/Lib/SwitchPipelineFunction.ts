import { PipelineFunction } from "../PipelineFunction";

export const SwitchPipelineFunction: PipelineFunction = {
    name: "switch",
    type: "value",
    phase: "transform",
    process: (context) => {
        const { value, parameters } = context;

        const switchValue = String(value);

        for (const parameter of parameters ?? []) {
            const separatorIndex = parameter.indexOf(":");

            if (separatorIndex === -1) {
                throw new Error(
                    `switch: invalid case "${parameter}" (expected "case:value")`
                );
            }

            const caseName = parameter.slice(0, separatorIndex).trim();
            const result = parameter.slice(separatorIndex + 1);

            if (caseName === switchValue) {
                return result;
            }

            if (caseName === "_") {
                continue;
            }
        }

        const defaultCase = parameters?.find((parameter) =>
            parameter.trimStart().startsWith("_:")
        );

        if (defaultCase) {
            return defaultCase.slice(defaultCase.indexOf(":") + 1);
        }

        throw new Error(
            `switch: no matching case for "${switchValue}"`
        );
    },
};