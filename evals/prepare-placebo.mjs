#!/usr/bin/env node
// Builds the placebo arm in a temporary directory: the placebo plugin plus a
// copy of the same cases and scaffold scripts, so `claude plugin eval` can run
// the identical suite against generic caution instead of operator-skills.
// It only copies files. It does not run an evaluation.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'operator-skills-placebo-'));
fs.cpSync(path.join(here, 'placebo'), out, { recursive: true });
fs.cpSync(path.join(here, 'cases'), path.join(out, 'evals', 'cases'), { recursive: true });
fs.cpSync(path.join(here, 'scaffold'), path.join(out, 'evals', 'scaffold'), { recursive: true });
console.log(out);
