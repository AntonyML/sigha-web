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
const later = new Date(t0 + 60_000).toISOString();
const earlier = new Date(t0 - 5 * 60_000).toISOString();
const now = new Date(t0).toISOString();

// A) EXIT creado en "now", cerrar con entrance = now (lo que hace la app: finalizeExitRecord)
const exitA = await attempt(() => ctx.post('/entrances-exits', { data: {
  eeType: 'visitor', eeAccessType: 'exit', eeIdentification: `9${String(t0).slice(-8)}`,
  eeName: 'Persona', eeFLastName: 'E2E', eeSLastName: 'A',
  eeDatetimeExit: now, eeClose: false,
} }));
const idA = (await exitA.json()).id;
let r = await attempt(() => ctx.patch(`/entrances-exits/${idA}/close-cycle`, { data: {
  eeClose: true, eeDatetimeEntrance: now, eeObservations: 'como la app (entrance=now)',
} }));
console.log('A) exit close entrance=now  ->', r.status(), JSON.stringify(await r.json()).slice(0, 200));

// B) EXIT creado en "now", cerrar con entrance = now + 60s (más tarde que la salida)
const exitB = await attempt(() => ctx.post('/entrances-exits', { data: {
  eeType: 'visitor', eeAccessType: 'exit', eeIdentification: `9${String(t0 + 1).slice(-8)}`,
  eeName: 'Persona', eeFLastName: 'E2E', eeSLastName: 'B',
  eeDatetimeExit: now, eeClose: false,
} }));
const idB = (await exitB.json()).id;
r = await attempt(() => ctx.patch(`/entrances-exits/${idB}/close-cycle`, { data: {
  eeClose: true, eeDatetimeEntrance: later, eeObservations: 'entrance despues de exit',
} }));
console.log('B) exit close entrance=+60s ->', r.status(), JSON.stringify(await r.json()).slice(0, 200));

// C) EXIT creado en "now", cerrar con entrance = now - 5min (antes de la salida)
const exitC = await attempt(() => ctx.post('/entrances-exits', { data: {
  eeType: 'visitor', eeAccessType: 'exit', eeIdentification: `9${String(t0 + 2).slice(-8)}`,
  eeName: 'Persona', eeFLastName: 'E2E', eeSLastName: 'C',
  eeDatetimeExit: now, eeClose: false,
} }));
const idC = (await exitC.json()).id;
r = await attempt(() => ctx.patch(`/entrances-exits/${idC}/close-cycle`, { data: {
  eeClose: true, eeDatetimeEntrance: earlier, eeObservations: 'entrance antes de exit',
} }));
console.log('C) exit close entrance=-5min ->', r.status(), JSON.stringify(await r.json()).slice(0, 200));

for (const id of [idA, idB, idC]) {
  await ctx.delete(`/entrances-exits/${id}`).catch(() => {});
}
await ctx.dispose();