---
name: communication-craft
description: "Do NOT use for casual or low-stakes messages, notes to self, drafts where the pattern is intentional, or code work. Use when the operator drafts or is about to send a substantive message or document, or replies to someone: an apology undone by an excuse (\"I'm sorry, but\"), a hedged ask (\"I was wondering if\"), a weak closing (\"let me know\"), padding, over-explaining, a document growing past one page, one version for several audiences, a sensitive message in async text, a message across status lines, an introduction, a soft no (\"let me think about it\"), hard or good news someone shared, a hard conversation coming up, or thanks that are overdue."
license: MIT — see plugin LICENSE
---

# Communication craft watch

Twenty-three rules around drafting, message-composition, and interpersonal-response patterns. When a draft is being written or about to send — or when receiving news / a soft no / overdue thanks — identify which craft-discipline failure is in play and apply the matching diagnostic.

## Rules

| Pattern | Trigger | Rule |
|---|---|---|
| Response with "but" / "however" before acknowledging | jumps to disagreement without first signaling the other point landed | [acknowledgment-first](rules/acknowledgment-first.md) |
| Apology containing "but" / "I was just" / excuse | drafted apology has an undoing clause | [apologies-without-excuses](rules/apologies-without-excuses.md) |
| Ask hedged / buried in soft framing | "I was wondering if maybe" / "would it be possible at some point" | [asks-that-are-actually-asks](rules/asks-that-are-actually-asks.md) |
| Excessive length / fluff in drafting | preamble / closing flourishes; 3 sentences would suffice | [brevity-isnt-rude](rules/brevity-isnt-rude.md) |
| Email ending weakly | "thoughts?" / "let me know" / "happy to discuss" / "open to feedback" | [emails-that-end-decisively](rules/emails-that-end-decisively.md) |
| Introduction that's one-way / contextless | "let me introduce" / "connecting you with" without naming benefit for each party | [introductions-that-help](rules/introductions-that-help.md) |
| Indirect signal that could be unspoken ask | "I'm just so swamped" / "I wish I had time to" / "if only someone would" | [is-this-an-ask](rules/is-this-an-ask.md) |
| Substantive message about to send without landing-test | substantive comm about to ship; no pre-send predict-how-it-lands check | [landing-test](rules/landing-test.md) |
| Draft surveys trade-offs without picking | closing "but maybe" / "we'll see" / "depends" / "open question" | [landing-the-plane](rules/landing-the-plane.md) |
| One piece trying to land for multiple audiences | one generic version trying to satisfy stakeholder + executive + peer | [multi-version-output](rules/multi-version-output.md) |
| Doc draft growing past one page | multi-section structure being built before a one-page version exists | [one-pager-discipline](rules/one-pager-discipline.md) |
| Punctuation that doesn't match intent | "?" on a decided statement; "." on a real question; ask-as-FYI | [question-or-statement](rules/question-or-statement.md) |
| Async message with sensitive content | feedback / disagreement / concern drafted in Slack / email / text where tone strips | [reading-the-room-virtually](rules/reading-the-room-virtually.md) |
| 90+ minutes seated without break | body reset — stand up, walk a loop, look out a window | [stand-up-skill](rules/stand-up-skill.md) |
| Communication crossing status lines | up to senior / executive / peer / junior / cross-functional / vendor | [status-aware](rules/status-aware.md) |
| Over-explanation undermining the position | "the reason is" / "let me explain" 2+ times; stacked "because" clauses | [stop-explaining](rules/stop-explaining.md) |
| Things thought of saying but didn't | monthly surface of deferred truth — right to be unsaid, or avoidance? | [unsaid](rules/unsaid.md) |
| Drafts written but not sent | end-of-session + weekly surface of un-sent drafts — right call or avoidance? | [unsent](rules/unsent.md) |
| Soft / ambiguous response that could be a no | "let me think about it" / "we'll see" / "I'll get back to you" / "interesting idea" | [is-this-a-no](rules/is-this-a-no.md) |
| Receiving hard news — hold space, don't fix | someone shares a death / loss / diagnosis / setback; about to respond | [when-someone-shares-bad-news](rules/when-someone-shares-bad-news.md) |
| Receiving good news — celebrate first | someone shares a win / promotion / milestone; about to respond | [when-someone-shares-good-news](rules/when-someone-shares-good-news.md) |
| Hard conversation incoming — structure before having it | "I have to talk to [person] about" / "performance conversation" / "tough convo coming up" | [difficult-conversation-prep](rules/difficult-conversation-prep.md) |
| Meaningful help unacknowledged | someone helped meaningfully; no specific thank-you sent | [thank-you-overdue](rules/thank-you-overdue.md) |

## Dispatch

Match the drafting moment to the rule. Apply. Yield. Don't stack multiple craft-rules in a single response — name the one that's in play.

## Suppression rules

- Mode is `explore`
- Communication is informal / to self / low-stakes
- Already addressed this rule in current draft cycle
- Pattern is genuinely intentional and the operator has named it as such

## What this skill never does

- Force corporate stiffness
- Block honest disagreement / pushback (some "buts" are necessary)
- Demand multi-page formal versions of casual messages
- Push the operator to send drafts they've deliberately decided to hold (unsent surfaces; it doesn't push)

## Cross-references

- `decision-discipline` — companion (landing-the-plane overlaps with pick-one decision discipline)

## Why this umbrella earns its keep

Communication failures compound silently. A hedged ask gets ignored; a weak closing produces a generic reply; an apology undone by "but" erodes trust; a multi-page doc loses the reader before the recommendation. None of these are visible at the moment of drafting — they show up later as misunderstanding, dropped balls, eroded relationships. Naming the craft pattern at the drafting moment, before send, catches the failure cheap. The cost of the catch is seconds; the cost of the un-caught failure is days-to-rebuild.

<!-- precedence:start -->
## Precedence across operator-skills

When more than one rule could respond:

- **Every tier 1 rule that matches responds in the same turn.** Give one combined answer that names each hazard and what each one needs, then wait. Settling one floor never releases another. For "dedupe this production patient table and save a backup in the repo", `migration-not-mutation` asks for a snapshot, and `phi-floor` decides where it may live: inside the database or an approved backup, never a file in the repository.
- **One correction per turn applies to tiers 2 to 4.** Among those, the highest tier wins and lower tiers wait or drop.
- **`solo-run-log` and `solo-run-debrief` keep the record of a run the operator approved.** They write what their rule files describe, never stop work, and never count as the turn's one correction.

| Tier | Rules | How they respond |
|---|---|---|
| 1 | `secrets-walk`, `phi-floor`, `migration-not-mutation`, `schema-discipline`, `auth-floor`, `solo-run-checklist`, `solo-run-contract` | Stop before the risky action and wait for the operator. No mode, sketch or "explore" label suppresses them. |
| 2 | `code-i-can-actually-run`, `hallucination-tripwire`, `citation-or-it-didnt-happen`, `claude-confabulating-context`, `am-i-being-led`, `reading-claudes-output-honestly`, `is-claude-just-agreeing`, `claude-disagrees` | Check or correct Claude's own output, say what changed, then continue. |
| 3 | `solo-run-log`, `solo-run-debrief` and every other engineering-floor and build-discipline rule | One short nudge, then yield. Never a hard stop. |
| 4 | Every other rule (communication, decision, honesty, strategy, usage and effective-usage rules, `solo-run-postmortem`) | Mention only when asked or clearly useful. Never interrupt work. |

Shared meanings:
- **Explore mode** starts only when the operator says so ("explore mode", "just sketching") and ends when they say so or start building something to ship. It quiets tiers 3 and 4, never tier 1.
- **Logged** means said in the conversation. Write to a file only after the operator agrees to that file, and never copy credentials or patient data into it.
- **Unknown stays unknown.** Claude cannot see clock time between messages, earlier sessions or usage counts. When a rule depends on them, ask or say they are unknown instead of guessing.

Owners for situations two rules both claim:

| Situation | Owner | The other rule |
|---|---|---|
| "ship it" or "looks good" right after a long change | `reading-claudes-output-honestly` asks once whether it was read | `handoff-at-the-boundary` waits until the operator has confirmed the review |
| "perfect" or "exactly" | `reading-claudes-output-honestly`, when it approves a long output | `prompt-archeology` only when the operator asks to keep a prompt |
| "while we're at it" during an active build | `scope-lock` | `park-the-idea` owns stray ideas outside an active build |
| "the latest version" of outside software | `citation-or-it-didnt-happen` | `name-the-version` owns the operator's own artifacts |
| Several options on the table | `pick-one` when the operator asks for a recommendation | `am-i-being-led` applies when Claude steered without being asked |
| An inline color or spacing value | `tokens-not-values`, only when the project has design tokens | `config-or-code` for other hardcoded values |
| "done" or "shipped" | `output-vs-outcome` for a report of finished work | `vibe-vs-real` only for a maturity claim about a product |
| A clinical, safety or data-integrity edge case | the engineering floors, as first-version work | `v1-versus-v2-thinking` never defers it |
<!-- precedence:end -->

<!-- triggers:start -->
## Rule triggers

| Rule | Fires on |
|---|---|
| [acknowledgment-first](rules/acknowledgment-first.md) | response jumping to "but" / "however" / "the issue is" without first acknowledging what the other person said |
| [apologies-without-excuses](rules/apologies-without-excuses.md) | drafting an apology — "I'm sorry" / "my apologies" / "I apologize for"; especially when followed by "but" / "I was just" / "to be fair" / "in my defense" |
| [asks-that-are-actually-asks](rules/asks-that-are-actually-asks.md) | "I was wondering if maybe" / "would it be possible at some point" / "if you had a chance to" / "no rush but" — ask buried in soft framing |
| [brevity-isnt-rude](rules/brevity-isnt-rude.md) | drafting is excessively long — preamble fluff, closing flourishes, context the recipient doesn't need, "I hope this finds you well" |
| [difficult-conversation-prep](rules/difficult-conversation-prep.md) | "I have to talk to [person] about", "difficult conversation with", "tough convo coming up", "I need to address", "performance conversation", "hard feedback" — the moment the operator announces an upcoming hard conversation |
| [emails-that-end-decisively](rules/emails-that-end-decisively.md) | email ending weakly — "thoughts?" / "let me know" / "happy to discuss" / "open to feedback" / "if you have any questions" |
| [introductions-that-help](rules/introductions-that-help.md) | drafting an introduction — "let me introduce" / "introducing" / "meet [X]" / "connecting you with" |
| [is-this-a-no](rules/is-this-a-no.md) | Someone gives the operator a soft / ambiguous response to an ask — "let me think about it", "we'll see", "I'll get back to you", "interesting idea", "maybe later", "I'll consider it", "good thought", or the operator's own "they didn't say no but I'm not sure" |
| [is-this-an-ask](rules/is-this-an-ask.md) | someone says "I'm just so swamped" / "I wish I had time to" / "the [thing] is really hard right now" / "if only someone would" — complaint-shaped statement that could be indirect ask |
| [landing-test](rules/landing-test.md) | substantive communication about to send (email, message, doc, presentation) without pre-send check |
| [landing-the-plane](rules/landing-the-plane.md) | draft surveys trade-offs without picking; closing with "but maybe" / "we'll see" / "depends" / "open question" |
| [multi-version-output](rules/multi-version-output.md) | one piece trying to land for multiple audiences (stakeholder AND executive AND peer); generic version that satisfies none |
| [one-pager-discipline](rules/one-pager-discipline.md) | doc draft going past one page (~500-700 words); multi-section structure being built before a one-page version exists; "comprehensive" / "thorough" / "complete" framing applied to a doc |
| [question-or-statement](rules/question-or-statement.md) | "?" at the end of a statement the operator has actually decided; "." at the end of a real question; asks buried in "let me know if you have thoughts" / soft-FYI framing; hedging that obscures whether action is requested |
| [reading-the-room-virtually](rules/reading-the-room-virtually.md) | drafting in async channels (Slack, Teams, email, text, DMs) AND the message has emotional / political / sensitive content (feedback, disagreement, concern, asking for something, addressing tension) |
| [stand-up-skill](rules/stand-up-skill.md) | the operator says they have been at it for hours, or asks for break reminders. Claude cannot see time between messages, so it does not guess. |
| [status-aware](rules/status-aware.md) | drafting communication that crosses status lines — up to a senior stakeholder, up to an executive, peer-to-peer, down to junior colleagues, lateral cross-functional, external vendors. Off-status framing (too casual up, too formal to peers, excessive hedging laterally) |
| [stop-explaining](rules/stop-explaining.md) | "the reason is" / "let me explain" appearing 2+ times in a short draft; stacked "because" clauses; draft length where 70%+ is justification, 30% is the position; pre-emptive defense ("I know you might think X, but...") |
| [thank-you-overdue](rules/thank-you-overdue.md) | Context shows someone helped the operator in a meaningful way AND no thank-you has been sent — "X helped me with Y", "Z's advice unblocked me", "thanks to W I figured out", or any acknowledgment-of-help moment without a recorded thank-you in return. — phrasings: "should I thank" / "never thanked them" |
| [unsaid](rules/unsaid.md) | monthly cadence (first session) + capture entries with "wish I'd said" / "should have told" / "wanted to say" |
| [unsent](rules/unsent.md) | end of session + weekly review cadence + capture / mention of un-sent drafts ("I drafted a thing but didn't send", "I have a post sitting in my drafts folder") |
| [when-someone-shares-bad-news](rules/when-someone-shares-bad-news.md) | Someone shares hard news with the operator (a death, job loss, diagnosis, relationship ending, a serious setback) and the operator is about to respond. Fires on significant heavy-content shares from anyone — a friend, peers, colleagues. — phrasings: "shared some hard news" / "someone shared bad news" |
| [when-someone-shares-good-news](rules/when-someone-shares-good-news.md) | Someone shares good news with the operator (a win, promotion, milestone, shipped work, recognition) and the operator is about to respond. Fires on celebratory shares. — phrasings: "just got promoted" / "shared good news" |
<!-- triggers:end -->
