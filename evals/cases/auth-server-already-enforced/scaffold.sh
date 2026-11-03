#!/usr/bin/env bash
# The server already enforces the admin rule and a test covers a non-admin
# request. Only the UI still shows the button to everyone.
set -eu
mkdir -p app/patients app/api/patients lib tests
cat > app/patients/page.tsx <<'TSX'
import { getSession } from '@/lib/session'
export default async function PatientPage({ searchParams }: { searchParams: { id: string } }) {
  const session = await getSession()
  return <main><h1>Patient {searchParams.id}</h1><form method="post" action={`/api/patients?id=${searchParams.id}&_method=DELETE`}><button>Delete</button></form></main>
}
TSX
cat > app/api/patients/route.ts <<'TS'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'
export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return new Response('unauthorized', { status: 401 })
  if (session.user.role !== 'admin') return new Response('forbidden', { status: 403 })
  const id = Number(new URL(req.url).searchParams.get('id'))
  const patient = await db.patient.findFirst({ where: { id, orgId: session.user.orgId } })
  if (!patient) return new Response('not found', { status: 404 })
  await db.patient.delete({ where: { id: patient.id } })
  return new Response(null, { status: 204 })
}
TS
cat > tests/delete-route.test.ts <<'TS'
import { DELETE } from '@/app/api/patients/route'
test('a non-admin cannot delete a patient', async () => {
  const res = await DELETE(new Request('http://x/api/patients?id=1'))
  expect(res.status).toBe(403)
})
TS
printf 'export async function getSession() { return { user: { id: 1, role: "staff", orgId: 7 } } }\n' > lib/session.ts
