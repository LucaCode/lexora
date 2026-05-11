import { ValueCache } from "../Utils/ValueCache";
import {
    CurrencyFormatOptions,
    DateFormatOptions,
    FormatAdapter,
    ListFormatOptions,
    NumberFormatOptions,
    PluralRule,
} from "./FormatAdapter";

function cacheKey(locale: string, options?: object): string {
    return `${locale}:${JSON.stringify(options ?? {})}`;
}

function getCached<K, V>(
    cache: ValueCache<K, V>,
    key: K,
    create: () => V
): V {
    const existing = cache.get(key);
    if (existing !== undefined) return existing;

    const value = create();
    cache.set(key, value);

    return value;
}

export function createIntlFormatAdapter(
    cacheSize = 60
): FormatAdapter {
    const pluralRulesCache =
        new ValueCache<string, Intl.PluralRules>(cacheSize);

    const numberFormatCache =
        new ValueCache<string, Intl.NumberFormat>(cacheSize);

    const currencyFormatCache =
        new ValueCache<string, Intl.NumberFormat>(cacheSize);

    const dateFormatCache =
        new ValueCache<string, Intl.DateTimeFormat>(cacheSize);

    const listFormatCache =
        new ValueCache<string, Intl.ListFormat>(cacheSize);

    return {
        selectPluralRule(locale, value) {
            return getCached(
                pluralRulesCache,
                locale,
                () => new Intl.PluralRules(locale)
            ).select(value) as PluralRule;
        },

        formatNumber(locale, value, options?: NumberFormatOptions) {
            return getCached(
                numberFormatCache,
                cacheKey(locale, options),
                () => new Intl.NumberFormat(locale, options)
            ).format(value);
        },

        formatCurrency(locale, value, options: CurrencyFormatOptions) {
            const intlOptions: Intl.NumberFormatOptions = {
                style: "currency",
                currency: options.currency,
                minimumFractionDigits: options.minimumFractionDigits,
                maximumFractionDigits: options.maximumFractionDigits,
            };

            return getCached(
                currencyFormatCache,
                cacheKey(locale, intlOptions),
                () => new Intl.NumberFormat(locale, intlOptions)
            ).format(value);
        },

        formatDate(locale, value, options?: DateFormatOptions) {
            return getCached(
                dateFormatCache,
                cacheKey(locale, options),
                () => new Intl.DateTimeFormat(locale, options)
            ).format(value);
        },

        formatList(locale, values, options?: ListFormatOptions) {
            return getCached(
                listFormatCache,
                cacheKey(locale, options),
                () => new Intl.ListFormat(locale, options)
            ).format(values);
        },
    };
}