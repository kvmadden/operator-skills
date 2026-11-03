---
title: Secrets walk. A credential never spreads, and an exposed one is rotated first
trigger: >-
  a credential-shaped value in chat, tool output, code, config, logs or a commit: provider prefixes such as `sk-`, `sk-proj-`, `sk-svcacct-`, `sk-ant-`, `sk_live_`, `sk_test_`, `rk_live_`, `AKIA`, `ASIA`, `ghp_`, `gho_`, `ghs_`, `github_pat_`, `glpat-`, `xoxb-`, `xoxp-`, `AIza`, `npm_`, a JWT starting `eyJ`, a private key header starting `-----BEGIN`, a connection string with a password ("postgres://user:password@host"), "pasted my .env", or a long random value next to "key", "token", "secret" or "password"
priority: high
---

## The pattern

A credential in a chat, a log, a commit, a notes file or a cache is exposed. If it was pasted into a hosted chat or printed in tool output that the model read, it has already left the machine, and deleting the message does not recall it. The bar is "could be a real credential", not "is one".

Recognize these shapes. The list is guidance for the agent. This plugin does not scan text for them, so a shape that is not listed can still be a credential.

| Type | Shape |
|---|---|
| OpenAI key | `sk-` then 20 or more characters, including project keys `sk-proj-` and service account keys `sk-svcacct-` |
| Anthropic key | `sk-ant-` then 20 or more characters |
| Stripe secret or restricted key | `sk_live_`, `sk_test_`, `rk_live_`, `rk_test_` |
| AWS access key ID | `AKIA` (long-term) or `ASIA` (temporary) then 16 uppercase letters or digits. The secret key next to it has no prefix |
| GitHub token | `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`, `github_pat_` |
| GitLab token | `glpat-` |
| Slack token | `xoxb-`, `xoxp-`, `xoxa-`, `xoxr-`, `xoxs-` |
| Google API key | `AIza` then 35 characters |
| npm token | `npm_` |
| JWT, including many hosted database keys | `eyJ` then two more dot-separated parts |
| Private key | any header of the form `-----BEGIN ... PRIVATE KEY-----`, including PKCS#8 `-----BEGIN PRIVATE KEY-----`, `-----BEGIN RSA PRIVATE KEY-----` and `-----BEGIN OPENSSH PRIVATE KEY-----` |
| Connection string with a password | `scheme://user:password@host` for postgres, mysql, mongodb, mongodb+srv, redis, amqp and similar |
| Other | 32 or more random-looking characters next to "key", "token", "secret" or "password" |

## Response

**HARD STOP before the value spreads further.** Work that does not touch the value can continue.

1. **Do not repeat it.** Do not quote, echo, copy, log, commit or summarize the value. Refer to it by kind and place only: "a Stripe live key on line 3 of the pasted block".
2. **If it might be real, rotate first.** Ask the operator to revoke or rotate it with the provider now. Cleaning files or history comes after rotation, not instead of it, because the value may already be outside the machine.
3. **Contain it:**
   - In a repository file: move it to an environment variable or a secret manager, keep it out of commits, and check history (`git log -p -S`) for earlier copies. If it was ever pushed, rotation is the fix and history rewriting is cleanup.
   - In tool output: do not copy that output into files, notes, commit messages, handoffs or summaries.
4. **Ask which case applies, then wait** for that part of the task:
   - "fake or test value": continue, for that specific value only
   - "real, rotating it now": continue once the operator says it is rotated
   - "real and needed here": set it up through an environment variable or secret manager without printing it

## Suppression

- Talking about credential handling as a topic, including this rule's own table
- Obvious placeholders (`your-api-key`, `<KEY>`, `xxxxx`, `REPLACE_ME`) and clearly redacted values such as `sk-...abc`
- A fixture value the operator confirmed as fake in this session. A different value still triggers the rule.

When unsure, treat it as real. A false alarm costs one sentence.

## Override

None for "log it anyway", "commit it anyway" or "just paste it back". The ways forward are: the operator confirms the specific value is fake, rotates it, or moves it to an environment variable or secret manager. Nothing about this rule is written to a file or log except the kind of credential and the operator's decision.
