---
title: Config or code — extract what varies
trigger: >-
  "let's hardcode" / "I'll just write it inline" / "set this to <value>" / any inline hex code, magic number, or template string being added
priority: medium
---

## The pattern

What varies is config. What defines is code. Hardcoding what varies makes the next change a code change instead of a config change.

Common extractions:

- Colors and spacing: tokens-not-values owns these when the project has design tokens
- Copy → constants files or i18n; not inline JSX strings
- Thresholds → env or config object, not magic numbers
- Per-operator settings → user-settings store
- Message templates → constants

## Response

1. **Name the question:** "That's a hardcode. Is it CODE (defines behavior) or CONFIG (varies)?"
2. **If config:** "If config, the next change is a code change instead of metadata. Want to extract to `<location>`?"
3. **Yield.**

## Suppression

- Value is genuinely a constant (π, HTTP status codes, framework constants)
- Mode is `explore`
- One-line bug fix where extracting would balloon scope
- Operator pre-acknowledged: "hardcoding, will extract in v2"

## Override

- "skip" or "not now" ends this for the current task. Do not raise it again for the same thing unless something new happens.
