#!/usr/bin/env bash
set -eu
mkdir -p prisma
cat > prisma/schema.prisma <<'PRISMA'
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Patient {
  id        Int      @id @default(autoincrement())
  name      String
  allergies String?
  createdAt DateTime @default(now())
}
PRISMA
printf -- '-- 1,200 existing rows, 1,031 of them with allergies NULL (synthetic counts for the task)\n' > prisma/NOTES.sql
