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

const now = new Date().toISOString();
const ident = `9${String(Date.now()).slice(-8)}`;
const ids = [];

async function attempt(fn, label) {
  for (let i = 1; i <= 4; i++) {
    const res = await fn();
    if (res.status() !== 429) return res;
    await new Promise((r) => setTimeout(r, i * 4000));
  }
  return null;
}

// 1) Create ENTRANCE
let res = await attempt(() => ctx.post('/entrances-exits', { data: {
  eeType: 'employee', eeAccessType: 'entrance', eeIdentification: ident,
  eeName: 'Persona', eeFLastName: 'E2E', eeSLastName: 'Entrada',
  eeDatetimeEntrance: now, eeClose: false, eeObservations: 'e2e entrance',
} }), 'create-entrance');
console.log('CREATE entrance:', res?.status());
let body = await res?.json();
console.log('  body:', JSON.stringify(body).slice(0, 400));
const idEnt = body?.id ?? body?.data?.id;
if (idEnt) {
  ids.push(idEnt);
  res = await attempt(() => ctx.patch(`/entrances-exits/${idEnt}/close-cycle`, { data: {
    eeClose: true, eeDatetimeExit: now, eeObservations: 'cierre e2e',
  } }), 'close-entrance');
  console.log('CLOSE entrance:', res?.status(), JSON.stringify(await res?.json()).slice(0, 300));
}

// 2) Create EXIT
res = await attempt(() => ctx.post('/entrances-exits', { data: {
  eeType: 'visitor', eeAccessType: 'exit', eeIdentification: ident,
  eeName: 'Persona', eeFLastName: 'E2E', eeSLastName: 'Salida',
  eeDatetimeExit: now, eeClose: false, eeObservations: 'e2e exit',
} }), 'create-exit');
console.log('CREATE exit:', res?.status());
body = await res?.json();
console.log('  body:', JSON.stringify(body).slice(0, 400));
const idExit = body?.id ?? body?.data?.id;
if (idExit) {
  ids.push(idExit);
  res = await attempt(() => ctx.patch(`/entrances-exits/${idExit}/close-cycle`, { data: {
    eeClose: true, eeDatetimeEntrance: now, eeObservations: 'cierre e2e exit',
  } }), 'close-exit');
  console.log('CLOSE exit:', res?.status(), JSON.stringify(await res?.json()).slice(0, 300));
}

// 3) Lists
for (const path of ['/entrances-exits/open-entrances', '/entrances-exits/open-exits', '/entrances-exits/closed-records']) {
  const r = await ctx.get(path);
  const b = await r.json().catch(() => ({}));
  const arr = Array.isArray(b) ? b : b?.data ?? [];
  const mine = arr.filter((x) => String(x.eeIdentification ?? x.ee_identification ?? '') === ident);
  console.log(`GET ${path}:`, r.status(), 'total=', arr.length, 'mine=', mine.length, 'sampleKeys=', Object.keys(arr[0] ?? {}).slice(0, 12).join(','));
}

// 4) Delete both
for (const id of ids) {
  const r = await ctx.delete(`/entrances-exits/${id}`);
  console.log(`DELETE /entrances-exits/${id}:`, r.status(), await r.text().catch(() => ''));
}

await ctx.dispose();