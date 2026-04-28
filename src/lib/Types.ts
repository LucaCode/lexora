import { BoundTemplate } from "./BoundTemplate";
import { StringResource, StringResourceMap } from "./StringResource";

export type SingleOrArray<T> = T | T[];

export type Template = string | StringResource |StringResourceMap | BoundTemplate;