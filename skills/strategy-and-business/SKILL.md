---
name: strategy-and-business
description: "Do NOT use for implementation questions, creative taste questions, relationship work, compliance or legal questions, or exploration where ideas come first. Use when the operator evaluates a product, initiative or spend through a business lens: defensibility (\"what's the moat\"), unit economics before scaling (\"let's scale this\"), costs and returns, market demand versus product quality, talent pipeline and succession, recurring subscriptions, cost versus investment, or treating a vendor as a pure transaction."
license: MIT — see plugin LICENSE
---

# Strategy and business umbrella

Business-lens evaluation of products, initiatives, and commitments. Each rule names a specific framework the operator can apply when evaluating something through a business angle.

## Rules

| Lens | Trigger | Rule |
|---|---|---|
| Defensibility | "is this defensible", "what's the moat", "competitors could copy in a weekend" | [moat-thinking](rules/moat-thinking.md) |
| Per-unit math at scale | "let's scale this", "more users", "wider rollout", "unit economics" | [unit-economics](rules/unit-economics.md) |
| Product success ≠ market success | "great product but no market", "the code is clean but does anyone want it" | [market-vs-product](rules/market-vs-product.md) |
| Talent / succession | "talent pipeline", "succession plan", "who's next for [role]", "we'll need to backfill" | [pipeline-thinking](rules/pipeline-thinking.md) |
| Revenue / cost / margin | "P&L", "revenue side", "cost side", "is the math working", "what does this earn" | [p-and-l-thinking](rules/p-and-l-thinking.md) |
| Cost (consumed) vs investment (returns) | "is this a cost or an investment", "one-time vs ongoing", "front-loaded vs ongoing" | [cost-vs-investment](rules/cost-vs-investment.md) |
| Recurring spend audit | "let's audit our subscriptions", "what are we paying for", quarterly cadence | [subscription-audit](rules/subscription-audit.md) |
| Vendor / external resource treated as pure transaction | "I just need them to do X", "send them the request", "the vendor should" — no relationship investment | [vendor-as-resource](rules/vendor-as-resource.md) |

## Dispatch logic

1. **Match the operator's question to the right lens.** If multiple apply (e.g. moat + unit-economics), surface both briefly and let the operator pick.
2. **Open that rule file.** Each has its own framework + question shape.
3. **Apply the response.** Default: name the framework, ask the operator's read of the situation through that frame.
4. **Yield.** Don't prescribe the answer.

## Suppression rules

- Pure execution question ("how do I implement X")
- Creative-craft evaluation (this is for business, not aesthetics)
- Mode is `explore` — ideation isn't the moment for business evaluation
- The operator already named the framework themselves

## What this skill never does

- Prescribe specific business answers (the operator's read is the value)
- Apply enterprise business frameworks to creative/personal questions
- Lecture on business theory
- Force a P&L on a personal-use-only project

## Cross-references

- `decision-discipline` umbrella — sibling (HOW to decide; this is about evaluating-as-business)
- `build-discipline` umbrella — companion (kill-criteria has business-evaluation flavor)

## Why this umbrella earns its keep

Solo builders and indie operators tend to evaluate work in craft-terms (does it work, does it look good) without the business-as-a-system lens. The result: products that work + look good but don't earn their keep; recurring spend that compounds silently; project sets that aren't optimized for compounding returns. The business lens isn't the only lens (craft matters; relationships matter; identity matters), but it's a lens many operators skip — and skipping it has real cost.

<!-- precedence:start -->
## Precedence across operator-skills

When more than one rule could respond, use this order. Give at most one correction per turn: the highest tier wins, and lower tiers wait or drop.

| Tier | Rules | How they respond |
|---|---|---|
| 1 | `secrets-walk`, `phi-floor`, `migration-not-mutation`, `schema-discipline`, `auth-floor`, `solo-run-checklist`, `solo-run-contract`, `solo-run-log`, `solo-run-debrief` | Stop before the risky action and wait for the operator. No mode, sketch or "explore" label suppresses them. |
| 2 | `code-i-can-actually-run`, `hallucination-tripwire`, `citation-or-it-didnt-happen`, `claude-confabulating-context`, `am-i-being-led`, `reading-claudes-output-honestly`, `is-claude-just-agreeing`, `claude-disagrees` | Check or correct Claude's own output, say what changed, then continue. |
| 3 | Every other engineering-floor and build-discipline rule | One short nudge, then yield. Never a hard stop. |
| 4 | Every other rule (communication, decision, honesty, strategy, usage and effective-usage rules, solo-run-postmortem) | Mention only when asked or clearly useful. Never interrupt work. |

Shared meanings:
- **Explore mode** starts only when the operator says so ("explore mode", "just sketching") and ends when they say so or start building something to ship. It quiets tiers 3 and 4, never tier 1.
- **Logged** means said in the conversation. Write to a file only after the operator agrees to that file, and never copy credentials or patient data into it.
- **Unknown stays unknown.** Claude cannot see clock time between messages, earlier sessions or usage counts. When a rule depends on them, ask or say they are unknown instead of guessing.

Owners for situations two rules both claim:

| Situation | Owner | The other rule |
|---|---|---|
| "ship it" or "looks good" right after a long change | reading-claudes-output-honestly asks once whether it was read | handoff-at-the-boundary waits until the operator has confirmed the review |
| "perfect" or "exactly" | reading-claudes-output-honestly, when it approves a long output | prompt-archeology only when the operator asks to keep a prompt |
| "while we're at it" during an active build | scope-lock | park-the-idea owns stray ideas outside an active build |
| "the latest version" of outside software | citation-or-it-didnt-happen | name-the-version owns the operator's own artifacts |
| Several options on the table | pick-one when the operator asks for a recommendation | am-i-being-led applies when Claude steered without being asked |
| An inline color or spacing value | tokens-not-values, only when the project has design tokens | config-or-code for other hardcoded values |
| "done" or "shipped" | output-vs-outcome for a report of finished work | vibe-vs-real only for a maturity claim about a product |
| A clinical, safety or data-integrity edge case | the engineering floors, as first-version work | v1-versus-v2-thinking never defers it |
<!-- precedence:end -->

## Trigger catalogue

Moved here from the skill description on 3 November 2026, unchanged. Claude Code shows at most 1,536 characters of a skill description in its skill listing and can show less when many skills are installed, so the long list was being cut. Claude reads this section after the skill loads. Where this older text disagrees with a rule file or the precedence section above, the rule file and the precedence section win.

> Use this skill whenever the operator evaluates a product, initiative, or commitment through a BUSINESS lens — moats, unit economics, P&L, market dynamics, scaling, recurring spend, cost vs investment framing. Triggers include phrases like "is this defensible", "what's the moat", "competitors could copy", "let's scale this", "more users", "wider rollout", "the unit economics", "cost per user", "revenue side", "cost side", "margin", "what's the P&L", "is the math working", "does anyone want it", "market for this", "willingness to pay", "the talent pipeline", "who's next for [role]", "succession plan", "let's audit our subscriptions", "what are we paying for", "what's earning its keep", "cost vs investment", "one-time vs ongoing", "this expense vs that investment". Consult the skill's rules/ folder to identify which lens fits (moat-thinking, unit-economics, market-vs-product, pipeline-thinking, p-and-l, cost-vs-investment, subscription-audit, vendor-as-resource) and apply that rule's evaluation framework. Soft teaching response — names the business question + asks the operator's read; doesn't prescribe specific answers. Different from `decision-discipline` (which is about HOW to decide); this is about evaluating-things-as-businesses. Do NOT use for pure execution questions ("how do I implement X"), creative-craft evaluation ("does this song sound good"), relationship work, or when the operator is in `explore` mode and ideation is the point.
