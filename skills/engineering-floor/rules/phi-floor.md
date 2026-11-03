---
title: PHI floor. Real-looking patient or personal data never enters prompts, files, logs or commits
trigger: >-
  real-looking data about a person in chat, tool output, fixtures, seed files, logs, screenshots or commits: a name with a date of birth, a medical record number ("MRN"), a Social Security number, an address, phone or email tied to care, dates of service, a diagnosis, medication or lab result tied to a person, an HL7 `PID|` segment, a FHIR `Patient` resource, a CCD or C-CDA document, DICOM header fields, or a request such as "use this EHR export", "turn these patient rows into fixtures" or "copy the production data into the test database"
priority: high
---

## The pattern

Protected health information (PHI) and other personal data must not be copied into places that outlive the task or leave the machine: prompts to hosted models, test fixtures, seed files, logs, error messages, analytics events, screenshots, commit history, notes and handoff files. The HIPAA Safe Harbor method lists 18 identifier types (45 CFR 164.514(b)(2)), and a record can stay identifiable when only some of them are removed. Free text such as a clinical note is the hardest to clean.

Absence is a claim about the whole input. Never say "no patient data found" unless every part of the input was read and understood. If an attachment, image, scanned page, truncated tool output or binary file could not be read, say "needs review" and name what was not read.

## Response

**HARD STOP before the data spreads further.** Work that does not touch it can continue.

1. **Do not repeat it.** Do not echo identifiers, copy rows into files, or paste them into commit messages, logs, notes or summaries. Refer to the data by kind and place: "five rows with names, birth dates and MRNs in the pasted CSV".
2. **Ask whether it is real:** "Is this real patient data, or synthetic?" Treat it as real until the operator says otherwise.
3. **If it is real or might be,** stop working with the values and offer wholly generated records with the same shape instead, for example Synthea for clinical histories, or a faker with real code sets such as ICD-10-CM, LOINC and RxNorm. Editing real records is not a substitute. Replacing names and record numbers leaves free text, rare conditions, exact dates, places and occupations that can still point to one person, so a transformed real record counts as de-identified only after the organization's approved de-identification process (Safe Harbor removal of all 18 identifier types with no actual knowledge that the rest identifies someone, or Expert Determination under 45 CFR 164.514(b)(1)) and its review. Claude does not make that call. If real data was already committed, pushed or sent to a service, tell the operator to follow their organization's privacy incident process. Do not judge whether it is a reportable breach.
4. **Keep only what the task needs.** A schema, generated rows or aggregate counts are usually enough to debug a parser or a query.
5. **Wait** for the answer before using the data.

## Suppression

- Data the operator states is synthetic and that is clearly synthetic, for example "Test Patient", MRN 000000 and dates in 1900
- Reference data with no person attached: drug names, code lists, value sets, published dosing tables
- Aggregate counts with no identifiers and no cell small enough to single someone out

## Override

- "synthetic: <how it was generated>", for the specific data shown

None for copying real-looking identifiers into the repository, a log, a notes file or a prompt to another service.
