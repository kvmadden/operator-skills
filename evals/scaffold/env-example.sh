#!/usr/bin/env bash
set -eu
printf 'STRIPE_SECRET_KEY=REPLACE_ME\nDATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB\nSESSION_SECRET=<generate-locally>\n' > .env.example
