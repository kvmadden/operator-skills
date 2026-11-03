#!/usr/bin/env bash
# A form component whose props are request data, not stored data.
set -eu
mkdir -p components
cat > components/PatientForm.tsx <<'TSX'
export type PatientFormProps = { name: string }
export function PatientForm({ name }: PatientFormProps) {
  return <section><h2>{name}</h2></section>
}
TSX
