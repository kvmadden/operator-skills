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

## Trigger catalogue

Moved here from the skill description on 3 November 2026, unchanged. Claude Code shows at most 1,536 characters of a skill description in its skill listing and can show less when many skills are installed, so the long list was being cut. Claude reads this section after the skill loads.

> Use this skill whenever the operator evaluates a product, initiative, or commitment through a BUSINESS lens — moats, unit economics, P&L, market dynamics, scaling, recurring spend, cost vs investment framing. Triggers include phrases like "is this defensible", "what's the moat", "competitors could copy", "let's scale this", "more users", "wider rollout", "the unit economics", "cost per user", "revenue side", "cost side", "margin", "what's the P&L", "is the math working", "does anyone want it", "market for this", "willingness to pay", "the talent pipeline", "who's next for [role]", "succession plan", "let's audit our subscriptions", "what are we paying for", "what's earning its keep", "cost vs investment", "one-time vs ongoing", "this expense vs that investment". Consult the skill's rules/ folder to identify which lens fits (moat-thinking, unit-economics, market-vs-product, pipeline-thinking, p-and-l, cost-vs-investment, subscription-audit, vendor-as-resource) and apply that rule's evaluation framework. Soft teaching response — names the business question + asks the operator's read; doesn't prescribe specific answers. Different from `decision-discipline` (which is about HOW to decide); this is about evaluating-things-as-businesses. Do NOT use for pure execution questions ("how do I implement X"), creative-craft evaluation ("does this song sound good"), relationship work, or when the operator is in `explore` mode and ideation is the point.
