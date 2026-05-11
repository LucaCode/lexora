# Lexora 🌍

[![Downloads](https://img.shields.io/npm/dm/lexora)](https://www.npmjs.com/package/lexora)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/lexora)](https://www.npmjs.com/package/lexora)
[![Test coverage](https://img.shields.io/badge/test%20coverage-100%20%25-brightgreen)](https://www.npmjs.com/package/lexora)

## What is Lexora

***Lexora*** is a lightweight, pipeline-based translation and formatting library for TypeScript.
It is designed for applications that need more than simple key-value translations, but still want to stay small, explicit and easy to reason about.

Lexora supports:
- language based string resources
- nested placeholders
- translation metadata
- value pipelines
- plural/form selection
- grammatical articles
- number, date, time, currency and list formatting
- watchable reactive strings
- composable grammar-aware pipelines

---

## Installation
```bash
npm install lexora
```

# Usage

## Basic

```ts
import { LexoraContext } from "lexora";

const ctx = LexoraContext.createWithDefaults();

ctx.loadMultipleStringResourceTranslations({
    house: {
        en: "house",
        de: "Haus",
    },
    greeting: {
        en: "Hello {{house}}",
        de: "Hallo {{house}}",
    },
});

ctx.language = "de";

ctx.get("greeting");
// "Hallo Haus"
```
## String Resources
A string resource can be either a plain string:
```ts
house: {
    en: "house",
    de: "Haus",
}
```
or a tuple with metadata:
```ts
house: {
    en: "house",
    de: ["Haus", { gender: "neuter" }],
}
```
Metadata is useful for language-specific pipeline functions, for example German articles.

## Templates
Templates can reference other resources with {{key}}.
```ts
ctx.translate("Hello {{name}}", {
    name: "Luca",
});
```
Output:
```ts
Hello Luca
```
Templates can also be stored as resources:
```ts
ctx.loadMultipleStringResourceTranslations({
    welcome: {
        en: "Welcome {{name}}",
        de: "Willkommen {{name}}",
    },
});
```
## Pipelines
Pipelines are written with ->.
```ts
ctx.translate("{{house->upper}}");
```
Example:
```ts
HOUSE
```
Pipelines can be chained:
```ts
ctx.translate("{{house->prefix('My ')->capitalize}}");
```
Output:
```ts
My house
```
### Built-in Pipelines
Lexora includes common default pipelines:
```ts
upper
lower
trim
capitalize
prefix
suffix
number
currency
date
time
boolean
list
form
switch
```
Language packs can add additional pipelines, such as articles.
## Plural and Forms
Lexora supports forms for grammatical variants like singular and plural.
```ts
point: {
    en: [{ _: "point", other: "points" }],
    de: [{ _: "Punkt", other: "Punkte" }, { gender: "masculine" }],
}
```
_ is the default form.
Use the form pipeline to select the correct form:
```ts
ctx.translate("{{count}} {{point->form(count)}}", {
    count: 1,
});
```
Output:
```ts
1 point
```
```ts
ctx.translate("{{count}} {{point->form(count)}}", {
    count: 5,
});
```
Output:
```ts
5 points
```
You can also select a form explicitly:
```ts
ctx.translate("{{point->form(:other)}}");
```
## German Articles

With metadata and language packs, Lexora can apply grammatical articles.

```ts
house: {
    de: ["Haus", { gender: "neuter" }],
}
```
```ts
ctx.language = "de";

ctx.translate("{{house->article(nominative)}}");
```
Output:
```ts
das Haus
```
Forms also work together with articles:
```ts
ctx.translate("{{point->form(count)->article(nominative)}}", {
    count: 5,
});
```
Output:
```ts
die Punkte
```

## Switch Pipeline
Use switch for semantic choices, for example gender-based labels.
```ts
ctx.loadMultipleStringResourceTranslations({
    maleUser: {
        en: "user",
        de: "Benutzer",
    },
    femaleUser: {
        en: "user",
        de: "Benutzerin",
    },
});
```
```ts
ctx.translate(
    "{{gender->switch('male:{{maleUser}}','female:{{femaleUser}}')}}",
    {
        gender: "female",
    }
);
```
Output:
Output:
```ts
Benutzerin
```
Switch results can contain nested placeholders and pipelines:
```ts
ctx.translate(
    "{{gender->switch('male:{{maleUser->upper}}','female:{{femaleUser->upper}}')}}",
    {
        gender: "female",
    }
);
```
Output:
```ts
BENUTZERIN
```
## Formatting
Numbers:
```ts
ctx.translate("{{value->number}}", {
    value: 1234.56,
});
```
Dates:
```ts
ctx.translate("{{value->date(long)}}", {
    value: new Date(),
});
```
Currency:
```ts
ctx.translate("{{value->currency(USD)}}", {
    value: 1234.56,
});
```
Lists:
```ts
ctx.translate("{{items->list}}", {
    items: ["apple", "banana", "cherry"],
});
```
## Call Context
Values passed in the call context override resources.
```ts
ctx.translate("{{house}}", {
    house: {
        en: "villa",
        de: "Villa",
    },
});
```
Context values can also include metadata:
```ts
ctx.translate("{{house->article(nominative)}}", {
    house: ["Villa", { gender: "feminine" }],
});
```
Output:
```ts
die Villa
```
## Watchable Strings
Lexora can create reactive strings that update when the language changes.
```ts
import { LexoraContext } from "lexora";

const ctx = LexoraContext.createWithDefaults();

ctx.loadMultipleStringResourceTranslations({
    greeting: {
        en: "Hello {{user}}",
        de: "Hallo {{user}}",
    },
});

ctx.language = "en";

const watch = ctx.translateWatch("{{greeting}}", {
    user: "Luca",
});

console.log(watch.value);
// -> Hello Luca

watch.on("update", (value) => {
    console.log("Updated:", value);
});

ctx.language = "de";

// console:
// Updated: Hallo Luca

console.log(watch.value);
// -> Hallo Luca
```
## Strict and Lenient Mode
Lexora can either throw errors or gracefully fall back.
```
const ctx = LexoraContext.createWithDefaults({
    ignoreMissingKeys: false,
    skipFailedPipelineFunctions: false,
    ignoreMissingPipelineFunctions: false,
});
```
Lenient mode:
```
const ctx = LexoraContext.createWithDefaults({
    ignoreMissingKeys: true,
    defaultValueForMissingKeys: "?",
    skipFailedPipelineFunctions: true,
    ignoreMissingPipelineFunctions: true,
});
```