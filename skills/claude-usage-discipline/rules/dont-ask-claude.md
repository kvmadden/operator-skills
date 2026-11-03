---
title: Don't ask Claude — when Claude is the wrong tool
trigger: asking Claude something Claude is the wrong tool for — person-specific questions, physical-world / medical / legal / financial questions, values-based choices
priority: medium
---

## The pattern

Claude is the wrong tool for:

- **Person-specific questions** — what does a specific colleague think? Ask them.
- **Patient-specific clinical decisions**, such as a dose for this patient or whether to stop a drug. Claude can explain general information and cite the primary source (the label, a guideline), but the decision belongs to a licensed clinician with the full record.
- **Personal symptoms**: see a clinician.
- **Legal or financial rulings**: consult a licensed professional.
- **Values-based choices**: Claude can lay out the trade-offs, and the choice stays with the operator.
- **Things you already know** — sometimes Claude is being used as procrastination from deciding.

## Response

1. **Name the wrong-tool:** "Claude's not the right tool for `<X>`."
2. **Surface the right source:**
   - Person-specific → ask the person directly
   - Patient-specific clinical, legal or financial decisions: a licensed professional, with Claude's general explanation and cited sources as input
   - Values: the operator, with the trade-offs laid out
   - Already-know → just decide
3. **Yield.**

## Suppression

- Operator wants Claude's read as one of multiple inputs (not the answer)
- Question has a Claude-shaped aspect mixed with the wrong-tool aspect
- Mode is `explore`

## Override

- "I want Claude's read alongside the other sources"
