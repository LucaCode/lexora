export type PluralRule =
    | "zero"
    | "one"
    | "two"
    | "few"
    | "many"
    | "other";

export interface NumberFormatOptions {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}

export interface CurrencyFormatOptions
    extends NumberFormatOptions {
    currency: string;
}

export type DateFormatStyle =
    | "full"
    | "long"
    | "medium"
    | "short";

export interface DateFormatOptions {
    dateStyle?: DateFormatStyle;
    timeStyle?: DateFormatStyle;
}

export type ListFormatType =
    | "conjunction"
    | "disjunction"
    | "unit";

export type ListFormatStyle =
    | "long"
    | "short"
    | "narrow";

export interface ListFormatOptions {
    type?: ListFormatType;
    style?: ListFormatStyle;
}

export interface FormatAdapter {
    selectPluralRule(
        locale: string,
        value: number
    ): PluralRule;

    formatNumber(
        locale: string,
        value: number | bigint,
        options?: NumberFormatOptions
    ): string;

    formatCurrency(
        locale: string,
        value: number | bigint,
        options: CurrencyFormatOptions
    ): string;

    formatDate(
        locale: string,
        value: Date | number,
        options?: DateFormatOptions
    ): string;

    formatList(
        locale: string,
        values: string[],
        options?: ListFormatOptions
    ): string;
}