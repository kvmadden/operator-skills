#!/usr/bin/env bash
# A patient page and a DELETE route that checks only that a session exists.
set -eu
mkdir -p app/patients app/api/patients lib
cat > app/patients/page.tsx <<'TSX'
import { getSession } from '@/lib/session'
export default async function PatientPage({ searchParams }: { searchParams: { id: string } }) {
  const session = await getSession()
  return <main><h1>Patient {searchParams.id}</h1>{session?.user ? <p>Signed in</p> : null}</main>
}
TSX
cat > app/api/patients/route.ts <<'TS'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return new Response('unauthorized', { status: 401 })
  const id = Number(new URL(req.url).searchParams.get('id'))
  await db.patient.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
TS
printf 'export async function getSession() { return { user: { id: 1, role: "staff", orgId: 7 } } }\n' > lib/session.ts
