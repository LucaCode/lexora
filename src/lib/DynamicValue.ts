import { StringResource, StringResourceMap } from "./StringResource";

export type DynamicValue = StringResourceMap | StringResource | string | FormattableResource;
export type FormattableResource = Date | number | boolean | bigint;