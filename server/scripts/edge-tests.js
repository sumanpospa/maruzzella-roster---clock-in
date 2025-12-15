import { io } from 'socket.io-client';

const BASE = process.env.URL || 'http://localhost:4001';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

console.log('[EDGE TEST] Connecting socket to', BASE);
const socket = io(BASE, { reconnectionAttempts: 5 });

const events = { timeLogCreated: [], timeLogUpdated: [], stateUpdated: [] };

await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('socket connect timeout')), 5000);
  socket.on('connect', () => {
    clearTimeout(timeout);
    console.log('[EDGE TEST] socket connected', socket.id);
    resolve();
  });
  socket.on('connect_error', (err) => {
    console.warn('[EDGE TEST] socket connect_error', err?.message || err);
  });
});

socket.on('timeLogCreated', (p) => events.timeLogCreated.push(p));
socket.on('timeLogUpdated', (p) => events.timeLogUpdated.push(p));
socket.on('stateUpdated', (s) => events.stateUpdated.push(s));

async function run() {
  const initialCounts = { timeLogCreated: events.timeLogCreated.length, timeLogUpdated: events.timeLogUpdated.length };

  // 1) PATCH non-existent id -> expect 404
  const patchUrl = `${BASE}/api/timeLogs/999999999999`;
  const patchRes = await fetch(patchUrl, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ clockOutTime: new Date().toISOString() }),
  });
  console.log('[EDGE TEST] PATCH non-existent status', patchRes.status);

  // 2) POST missing employeeId -> server historically accepted this; expect 201 with id
  const postMissingRes = await fetch(`${BASE}/api/timeLogs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  console.log('[EDGE TEST] POST missing employeeId status', postMissingRes.status);
  const postMissingJson = postMissingRes.ok ? await postMissingRes.json() : null;

  // 3) 5 concurrent POSTs
  const ids = [4000, 4001, 4002, 4003, 4004];
  const promises = ids.map((eid) =>
    fetch(`${BASE}/api/timeLogs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ employeeId: eid }),
    }),
  );

  const results = await Promise.all(promises);
  const statuses = results.map((r) => r.status);
  console.log('[EDGE TEST] concurrent POST statuses', statuses.join(','));
  const jsons = await Promise.all(results.map((r) => (r.ok ? r.json() : Promise.resolve(null))));

  // allow socket events to arrive
  await wait(600);

  const finalCounts = { timeLogCreated: events.timeLogCreated.length, timeLogUpdated: events.timeLogUpdated.length };
  const deltaCreated = finalCounts.timeLogCreated - initialCounts.timeLogCreated;

  const expectedNew = 1 + ids.length; // one postMissing + concurrent posts

  const outcomes = [];
  outcomes.push({ test: 'PATCH_NON_EXISTING', status: patchRes.status });
  outcomes.push({ test: 'POST_MISSING_EMPLOYEE', status: postMissingRes.status, body: postMissingJson });
  outcomes.push({ test: 'CONCURRENT_POSTS', statuses, created: jsons });
  outcomes.push({ test: 'SOCKET_DELTAS', deltaCreated, expectedNew, eventsCaptured: events.timeLogCreated.length });

  // Basic assertions
  let pass = true;
  if (patchRes.status !== 404) {
    pass = false;
    console.error('[EDGE TEST] FAIL: PATCH non-existent expected 404');
  }
  if (postMissingRes.status !== 201) {
    pass = false;
    console.error('[EDGE TEST] FAIL: POST missing employee expected 201');
  }
  const createdSuccesses = statuses.filter((s) => s === 201 || s === 200).length;
  if (createdSuccesses !== ids.length) {
    pass = false;
    console.error('[EDGE TEST] FAIL: concurrent posts expected', ids.length, 'successes got', createdSuccesses);
  }
  if (deltaCreated < expectedNew) {
    pass = false;
    console.error('[EDGE TEST] WARN: expected at least', expectedNew, 'timeLogCreated events, got', deltaCreated);
  }

  console.log('[EDGE TEST] outcomes', JSON.stringify(outcomes, null, 2));

  // Cleanup and exit
  socket.close();
  if (pass) {
    console.log('[EDGE TEST] ALL TESTS PASSED');
    process.exit(0);
  } else {
    console.error('[EDGE TEST] SOME TESTS FAILED');
    process.exit(2);
  }
}

run().catch((err) => {
  console.error('[EDGE TEST] ERROR', err);
  try {
    socket.close();
  } catch (e) {}
  process.exit(3);
});
