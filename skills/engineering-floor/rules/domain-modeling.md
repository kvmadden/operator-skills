---
title: Domain modeling — entities and relationships in plain English first
trigger: domain data shapes (Orders, Invoices, Shipments, etc.) being designed; tables or types being authored without prior entity-relationship articulation
priority: medium
---

## The pattern

Domain shapes deserve articulation in plain English before tables or types. Sloppy model = sloppy thinking.

The four things to name:

- **Entities** — what are the nouns; what defines each
- **Relationships** — how do entities relate (one-to-many, many-to-many, etc.)
- **Lifecycle** — how does each entity come into being, change, end
- **Boundary** — what's IN the domain; what's OUT

## Response

1. **Surface:** "Before tables / types — domain in plain English. Entities? Relationships? Lifecycle? Boundary?"
2. **Help articulate** in prose first; then translate to schema / types.
3. **Yield.**

## Suppression

- Domain already modeled in this session or referenced doc
- Mode is `explore`
- One-off helper that doesn't merit a domain pass
