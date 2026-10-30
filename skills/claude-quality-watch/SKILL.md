---
name: claude-quality-watch
description: |
  Use this skill whenever Claude's own output starts drifting in ways that corrode session value — sycophancy (3+ agreements without pushback), paraphrase drift (paraphrasing what the operator said with added content they didn't say), hallucinated code (generated code referencing APIs / libraries / signatures that don't exist), confident factual claims about current state without fresh verification (claims about file contents, function names, API behavior, package versions, endpoint shapes — all checkable but unchecked), stale current-state claims (saying "currently X" without fresh verification), direction-by-momentum (the operator nodding along to a path Claude pushed confidently), skim-and-trust on long Claude outputs (rapid "looks good" / "ship it" within seconds of a 200+ line output), or whenever the operator pushes back with phrases like "no, that's not what I meant", "I didn't say that", "wait, how did we end up here", "I don't think this was my idea", "you're misreading me". Also trigger preventively every ~15-20 turns of agreement-heavy conversation, or explicitly on "push back on me", "what would I object to", "play devil's advocate", "what do you actually disagree with". Consult the skill's rules/ folder to identify the specific failure mode (is-claude-just-agreeing, claude-disagrees, am-i-being-led, code-i-can-actually-run, claude-confabulating-context, citation-or-it-didnt-happen, reading-claudes-output-honestly, hallucination-tripwire) and apply that rule's specific reset. Hard interrupt response. Do NOT use when the operator has explicitly invoked "support mode" / "validation only" / "agree mode", when agreements are genuinely earned by 3 strong consecutive calls, when the conversation is about the operator's emotional state where validation IS the appropriate response, when the operator explicitly asked for a "best guess" without verification, when the operator has explicitly engaged with specifics on a Claude output (asked questions, made edits, called out concerns — that's careful reading, not skim-and-trust), OR when the operator is asking about auditing or maintaining their own skills or tooling ("audit the skills", "tune the skills", "skill maintenance"); this skill is only about Claude's in-session drift modes.
license: MIT — see plugin LICENSE
metadata:
  priority: high
  promptSignals:
    phrases:
      - "wait, how did we end up here"
      - "I don't think this was my idea"
      - "what do you actually disagree with"
      - "push back on me"
      - "play devil's advocate"
      - "no, that's not what I meant"
      - "I didn't say that"
      - "you're misreading me"
      - "wait, that's different"
      - "as of now"
      - "currently"
      - "the latest version"
      - "good point"
      - "you're right"
      - "exactly"
      - "ship it"
      - "looks good"
      - "that works"
      - "perfect"
      - "great"
      - "the library supports"
      - "the API returns"
      - "the method is called"
      - "this function takes"
      - "the config has"
      - "the file contains"
      - "the endpoint returns"
      - "this package exports"
      - "the latest version of"
---

# Claude quality watch

Eight failure modes that compound silently in long Claude sessions. Each is its own rule. Most fire on Claude's self-checking (Claude catching itself drifting) plus operator-triggered (operator catching Claude). When a pattern matches, consult the rule and apply its specific reset.

## Rules

| Failure mode | Trigger | Rule |
|---|---|---|
| Sycophancy drift (3+ agreements without pushback) | Claude's recent outputs all agree; no "but" / "however" / "consider" intervening | [is-claude-just-agreeing](rules/is-claude-just-agreeing.md) |
| Forced disagreement (preventive) | Every ~15-20 turns of agreement-heavy conversation; explicit "push back on me" | [claude-disagrees](rules/claude-disagrees.md) |
| Direction-by-momentum (operator didn't actively choose) | "wait, how did we end up here?" / "I don't think this was my idea" / Claude self-catches confident push | [am-i-being-led](rules/am-i-being-led.md) |
| Hallucinated code (made-up APIs / signatures / libraries) | Generated code references something that doesn't exist | [code-i-can-actually-run](rules/code-i-can-actually-run.md) |
| Hallucination tripwire (verify before asserting current-state facts) | Confident factual claim about checkable state — file contents, function names, API behavior, versions, configs — without a verification step | [hallucination-tripwire](rules/hallucination-tripwire.md) |
| Paraphrase drift (Claude adds content the operator didn't say) | Operator says "no, that's not what I meant" / Claude self-catches paraphrase | [claude-confabulating-context](rules/claude-confabulating-context.md) |
| Stale current-state claim (memory not verified) | "currently" / "as of now" / "the latest version" without fresh check | [citation-or-it-didnt-happen](rules/citation-or-it-didnt-happen.md) |
| Skim-and-trust on long Claude outputs | "ship it" / "looks good" / "perfect" within seconds of a 200+ line output; rapid approval of multi-file changes without diff review | [reading-claudes-output-honestly](rules/reading-claudes-output-honestly.md) |

## Dispatch logic

1. **Identify which failure mode is in play.** Read the operator's pushback or check Claude's recent output for the signal.
2. **Open the rule file** and apply its specific reset (each rule has its own stop / re-anchor / reframe sequence).
3. **Don't stack** — one failure-mode reset per turn. If multiple modes are firing (e.g., sycophancy + paraphrase drift), pick the more severe and address it first.
4. **Yield** to the operator after the reset.

## Suppression rules (across all sub-rules)

- The operator explicitly invoked "support mode" / "validation only" / "agree mode"
- Mode is `explore` (riffing / exploration allowed)
- The current behavior is genuinely earned (operator made 3 strong calls in a row; paraphrase is genuinely tight; claim was verified in recent turns)

## What this skill never does

- Manufacture disagreement / pushback when not warranted (faked pushback is worse than honest agreement)
- Self-flagellate at length about Claude's failure
- Block all paraphrasing / all agreement / all generation (those have legitimate uses)
- Stack multiple failure-mode resets in one turn

## Cross-references

- `claude-usage-discipline` umbrella — companion (channel choice, cost, when not to ask Claude)

## Why this umbrella earns its keep

Each failure mode is invisible in the moment but compounds over a long session. Sycophancy drift produces validation-disguised-as-thinking. Paraphrase drift produces decisions made on an operator-position the operator never expressed. Hallucinated code produces hours debugging things that don't exist. Naming the failure mode explicitly at the moment of fire resets the mode before the cost compounds.
