import { request } from '@playwright/test';
import { readFileSync } from 'node:fs';

const state = JSON.parse(readFileSync('e2e/.auth/user.json', 'utf-8'));
const ls = Object.fromEntries(
  (state.origins?.[0]?.localStorage ?? []).map((i) => [i.name, i.value]),
);
const baseURL = process.env.E2E_API_URL ?? 'http://localhost:3000';
const ctx = await request.newContext({
  baseURL,
  extraHTTPHeaders: { Authorization: `Bearer ${ls.authToken}` },
});

async function attempt(fn) {
  for (let i = 1; i <= 4; i++) {
    const res = await fn();
    if (res.status() !== 429) return res;
    await new Promise((r) => setTimeout(r, i * 4000));
  }
  return null;
}

const t0 = Date.now();
const now = new Date(t0).toISOString();

// D) EXIT creado y cerrado sin fechas (solo eeClose)
const d = await attempt(() => ctx.post('/entrances-exits', { data: {
  eeType: 'visitor', eeAccessType: 'exit', eeIdentification: `9${String(t0).slice(-8)}`,
  eeName: 'Persona', eeFLastName: 'E2E', eeSLastName: 'D',
  eeDatetimeExit: now, eeClose: false,
} }));
const idD = (await d.json()).id;
let r = await attempt(() => ctx.patch(`/entrances-exits/${idD}/close-cycle`, { data: { eeClose: true } }));
console.log('D) exit close sin fechas      ->', r.status(), JSON.stringify(await r.json()).slice(0, 200));

// E) ENTRANCE creado y cerrado con exit=now (patrón de la app finalizeEntranceRecord)
const e = await attempt(() => ctx.post('/entrances-exits', { data: {
  eeType: 'employee', eeAccessType: 'entrance', eeIdentification: `9${String(t0 + 1).slice(-8)}`,
  eeName: 'Persona', eeFLastName: 'E2E', eeSLastName: 'E',
  eeDatetimeEntrance: now, eeClose: false,
} }));
const idE = (await e.json()).id;
r = await attempt(() => ctx.patch(`/entrances-exits/${idE}/close-cycle`, { data: {
  eeClose: true, eeDatetimeExit: now, eeObservations: 'finalizeEntranceRecord',
} }));
console.log('E) entrance close exit=now    ->', r.status(), JSON.stringify(await r.json()).slice(0, 200));

for (const id of [idD, idE]) {
  await ctx.delete(`/entrances-exits/${id}`).catch(() => {});
}
await ctx.dispose();