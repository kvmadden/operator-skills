#!/usr/bin/env bash
set -eu
mkdir -p 'app/patients/[id]' 'app/api/patients/[id]' lib
cat > 'app/patients/[id]/page.tsx' <<'TSX'
import { getSession } from '@/lib/session'
export default async function PatientPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  return <main><h1>Patient {params.id}</h1>{session?.user ? <p>Signed in</p> : null}</main>
}
TSX
cat > 'app/api/patients/[id]/route.ts' <<'TS'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return new Response('unauthorized', { status: 401 })
  await db.patient.delete({ where: { id: Number(params.id) } })
  return new Response(null, { status: 204 })
}
TS
printf 'export async function getSession() { return { user: { id: 1, role: "staff", orgId: 7 } } }\n' > lib/session.ts
