import { StringResource, StringResourceMap } from "./StringResource";
import { SingleOrArray } from "./Types";

export type DynamicValue = SingleOrArray<StringResourceMap | StringResource | string | FormattableResource>;
export type FormattableResource = Date | number | boolean | bigint;