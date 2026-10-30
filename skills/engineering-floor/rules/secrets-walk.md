---
title: Secrets walk — credentials never enter chat, repos, or logs
trigger: credential-shaped strings (sk-, sk_live, sk_test, AKIA, ghp_, github_pat_, eyJ..., -----BEGIN PRIVATE KEY-----) / `.env` content being pasted / Bash output containing credentials / hardcoded credentials in source
priority: high
---

## The pattern

Credentials never enter chat logs, repos, commit messages, or cache files. If a credential surfaces, halt the work, scrub it, then continue. The bar is **could be**, not **is**.

Better false positives than false negatives. The cost of a key in a public commit (or even a private one — keys leak via screenshots, search indexing, agent memory) is severe.

Credential patterns to watch for:

| Type | Pattern |
|---|---|
| OpenAI API key | `sk-[A-Za-z0-9]{20,}` |
| Anthropic API key | `sk-ant-[A-Za-z0-9-]{20,}` |
| Stripe (live/test) | `sk_live_[...]` / `sk_test_[...]` |
| AWS access key | `AKIA[0-9A-Z]{16}` |
| GitHub PAT | `ghp_[A-Za-z0-9]{36,}` |
| GitHub fine-grained PAT | `github_pat_[A-Za-z0-9_]{50,}` |
| JWT (includes many hosted-DB keys) | `eyJ[...].[...].[...]` |
| SSH private key | `-----BEGIN [A-Z ]+PRIVATE KEY-----` |
| Generic high-entropy in credential context | 32+ mixed-alphanum chars near "key", "token", "secret", "password" |

## Response

**HARD STOP.** Do not echo the suspect content. Do not log it.

1. **Halt immediately.**
2. **Quote nothing.** Don't paste the suspect text back to the operator in chat — that persists it.
3. **Name the trigger generically:** "Stopped — that looks like a credential (`<generic pattern type — Anthropic key, AWS key, JWT, etc.>`)."
4. **Ask for clearance:**
   "Confirm one:
   - **'fake / test value'** — proceed (logged as confirmed-test)
   - **'real, scrub it'** — wait while the operator removes and re-pastes with the value redacted
   - **'real, but legitimately needed here'** — talk through whether this needs to be in env / vault instead, do not proceed yet"
5. **Wait.**

If the credential was already pasted in this session's chat, mention scrubbing the original message and starting fresh.

## Suppression

- Discussing the rule itself (this very rule file mentions credential patterns; discussion, not data)
- Discussing credential management as a concept (rotation, vault, etc.)
- Generic placeholder strings (`your-anon-key`, `YOUR-SERVICE-ROLE-KEY`, `<KEY>`, `xxxxx`)
- Truncated/redacted strings (e.g., `sk-...abc` where the operator has clearly redacted)
- Test fixtures explicitly marked as fake (`fakeApiKey = "sk-fake"`)

When unsure: **fire**. False positives are cheap.

## Override

NO override for "trust me, log it anyway." The skill never accepts that.

The only paths forward:
1. The operator confirms "fake/test" — log + proceed
2. The operator scrubs the real value — proceed with scrubbed version
3. The operator halts the work entirely

State writes for this rule MUST exclude the suspect content. Only the generic pattern type + the operator's resolution. Never write the credential to any log or file.
