
import { PipelineFunction } from "../../../PipelineFunction/PipelineFunction";

export const BooleanPipelineFunction: PipelineFunction = {
    name: "boolean",
    process: (context) => {
        const { value } = context;
        if (typeof value !== "boolean") throw new Error("boolean: value must be boolean");
        return value ? "Ja" : "Nein";
    }
};
