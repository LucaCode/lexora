import { BoundTemplate } from "./BoundTemplate";
import { StringResourceMap } from "./StringResource";

export type SingleOrArray<T> = T | T[];

export type Template = string | StringResourceMap | BoundTemplate;