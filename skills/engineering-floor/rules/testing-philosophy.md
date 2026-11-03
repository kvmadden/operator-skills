---
title: Testing philosophy — test the contract, not the implementation
trigger: >-
  "let me write a test" / "add a test for" / "I should test this" / "let me mock this" / `*.test.*` files being created / `expect(...).toHaveBeenCalled` / `.toHaveBeenCalledWith` patterns
priority: medium
---

## The pattern

**Test the contract, not the implementation.** The contract is what the code promises to its callers; the implementation is how it keeps the promise. Implementations should be free to change; contracts should be stable.

Symptoms of implementation tests:
- Asserts on private/internal state
- Asserts on specific function call counts ("expect this.foo to have been called 3 times")
- Asserts on specific render output (down to the DOM node) when the contract is "renders the 5 most-recent items"
- Mocks every dependency, never tests real integration
- Breaks on every refactor

Symptoms of contract tests:
- Asserts on input → output
- Asserts on observable behavior (what the user sees, what the API returns)
- Tests work after refactors
- Few mocks; integration when feasible

Vibe-coded test suites tend toward implementation tests because Claude defaults to "make every assertion pass." That produces test suites that take longer to maintain than the code they test, break on every refactor without surfacing real regressions, and make the codebase HARDER to change, not safer.

## Response

Soft path:

1. **Name the question:** "Is this testing the contract (input → output) or the implementation (specific calls / private state)?"
2. **If implementation-style:** "Implementation tests break on refactors. Want to assert on the observable behavior instead?"
3. **Offer the corrective:** Convert the assertion to input → output where possible.
4. **Yield.**

Hard path — when assertions are clearly on private state or call counts:

1. **Stop.** Don't ship the implementation test.
2. **Name the cost:** "This test asserts on `<private state | call count>`. It'll break on refactor and add nothing — every refactor will need to update this test even when behavior is unchanged."
3. **Refuse:** "Refusing to ship this test as-is. Either rewrite to assert on observable behavior or explicitly say 'I know — implementation test.'"

## Suppression

- Test infrastructure setup (configuring Vitest, Playwright) — not test content
- Mode is `explore` — sketching tests is fine
- Test is genuinely testing implementation by intent (a complex algorithm where the implementation IS the contract)
- The operator already named the contract-vs-implementation choice in this session

## Override

- "implementation test by intent"
- "the contract IS the call sequence"
- "I know — testing internals"
