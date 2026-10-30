---
name: communication-craft
description: |
  Use this skill whenever the operator is drafting a substantive message, document, or other piece of written communication AND a craft-discipline failure is in play (or about to be). Apply across email, Slack/Teams DMs, async docs, presentations, memos, status updates, intros, apologies, asks, drafts of all kinds. Triggers include phrases like "let me draft", "writing this email", "drafting a message", "let me put together" (drafting moments); "I'm sorry", "my apologies", "I apologize for", followed by "but" / "I was just" / "in my defense" (apology-undone); "I was wondering if", "would it be possible at some point", "if you had a chance to", "no rush but" (hedged asks); message growing past 3-4 paragraphs when 3 sentences would suffice, "I hope this finds you well" preamble fluff (length-bloat); endings like "thoughts?", "let me know", "happy to discuss", "open to feedback", "if you have any questions" (weak closings); "let me introduce", "connecting you with", "meet [X]" (intro drafting); "I'm just so swamped", "I wish I had time to", "if only someone would", "the [thing] is really hard right now" (indirect-ask signal); doc draft going past one page or framed as "comprehensive" / "thorough" / "complete" (one-pager violation); punctuation that doesn't match intent — "?" on a decided statement, "." on a real question, "let me know if you have thoughts" closing a thread that needs a decision (question-or-statement mismatch); async messages with emotional / political / sensitive content where tone could read cold or aggressive in text (async-tone-strip); communication crossing status lines — to a senior stakeholder, executive, peer, junior colleague, or cross-functional partner (status-aware); "the reason is" / "let me explain" appearing 2+ times, stacked "because" clauses, pre-emptive defense (over-explanation); one piece trying to land for multiple audiences in a single generic version (multi-audience smush); substantive message about to send without a pre-send predict-how-it-lands check (landing test); draft that surveys trade-offs without picking a position (landing the plane); end-of-session and weekly-review cadence (surface unsent drafts); monthly cadence (surface things thought-of-saying but never said); 90+ minutes seated without break (body reset). Apply even when the operator hasn't asked for a check — naming the craft pattern at the drafting moment is the value. Consult the skill's rules/ folder to identify the specific drafting shape and apply that rule's matching diagnostic. Soft teaching response. Do NOT use for informal / casual / low-stakes messages, `explore` mode drafting, communication to the operator themselves (notes / journal), drafts where the pattern is genuinely intentional, or feedback drafting (that is a separate skill from craft mechanics).
license: MIT — see plugin LICENSE
metadata:
  priority: medium
  promptSignals:
    phrases:
      - "let me draft"
      - "let me reply"
      - "let me reply to"
      - "actually, the issue is"
      - "the issue is she"
      - "the issue is he"
      - "she doesn't get what I meant"
      - "he doesn't get what I meant"
      - "writing this email"
      - "drafting a message"
      - "let me put together"
      - "I'm sorry"
      - "my apologies"
      - "I apologize for"
      - "I was wondering if"
      - "would it be possible at some point"
      - "if you had a chance to"
      - "no rush but"
      - "I hope this finds you well"
      - "thoughts?"
      - "let me know"
      - "happy to discuss"
      - "open to feedback"
      - "if you have any questions"
      - "let me introduce"
      - "connecting you with"
      - "meet [X]"
      - "I'm just so swamped"
      - "I wish I had time to"
      - "if only someone would"
      - "the reason is"
      - "let me explain"
      - "comprehensive doc"
      - "for the team and for executives"
      - "before I send this"
      - "wish I'd said"
      - "I drafted a thing but didn't send"
      - "let me think about it"
      - "they said they'll get back to me"
      - "I have to talk to"
      - "performance conversation"
      - "tough convo coming up"
      - "should I thank"
      - "shared some hard news"
      - "she just got promoted"
      - "he just shared good news"
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
