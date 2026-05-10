import { PipelineFunction } from "../PipelineFunction";
import { SR } from "../../StringResource";

export const FormPipelineFunction: PipelineFunction = {
    name: "form",
    type: "value",
    phase: "select",
    process: (context) => {
        const value = context.value;
        if (!SR.isStringResource(value)) return context.value;
        const forms = SR.getValue(value);
        if(!SR.isForms(forms)) return context.value;

        const parameter = context.parameters?.[0];
        if (!parameter) return forms._ ?? "";

        if (parameter.startsWith(":")) {
            const formName = parameter.slice(1);
            context.executionContext.form = formName;
            return forms[formName as Intl.LDMLPluralRule] ?? forms._ ?? "";
        }

        const numberValue = Number(context.callContext[parameter]);
        if (!Number.isFinite(numberValue)) {
            throw new Error(`form: invalid count "${numberValue}" (expected number or explicit form like ":other")`);
        }

        const rule = new Intl.PluralRules(context.language).select(numberValue);
        context.executionContext.form = rule;
        return forms[rule as Intl.LDMLPluralRule] ?? forms._ ?? "";
    },
};