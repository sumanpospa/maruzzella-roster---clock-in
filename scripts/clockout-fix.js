#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import nodeFetch from 'node-fetch';

const fetch = globalThis.fetch ?? nodeFetch;

const API = process.env.API_BASE || 'http://localhost:4000';
const STATE_URL = `${API}/api/state`;

;(async function main() {
  try {
    console.log('[INFO] Fetching state from', STATE_URL);
    const res = await fetch(STATE_URL);
    if (!res.ok) throw new Error(`GET failed: ${res.status}`);
    const state = await res.json();

    // Backup current state
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(
      backupDir,
      `clockout-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    );
    fs.writeFileSync(backupPath, JSON.stringify(state, null, 2), 'utf8');
    console.log('[INFO] Backup written to', backupPath);

    const idsToFix = [7, 8]; // Siyam (7), Taki (8)
    const now = Date.now();
    const fourteenHoursAgo = new Date(now - 14 * 60 * 60 * 1000).toISOString();

    let changed = 0;
    if (!Array.isArray(state.timeLogs)) state.timeLogs = [];
    state.timeLogs = state.timeLogs.map((log) => {
      if (idsToFix.includes(log.employeeId) && (log.clockOutTime === null || log.clockOutTime === undefined)) {
        console.log(
          `[PATCH] Setting clockOutTime for employeeId=${log.employeeId} (log id=${log.id}) to ${fourteenHoursAgo}`,
        );
        changed++;
        return { ...log, clockOutTime: fourteenHoursAgo };
      }
      return log;
    });

    if (changed === 0) {
      console.log('[INFO] No matching open shifts found for employees', idsToFix);
      process.exit(0);
    }

    // POST updated state back
    console.log('[INFO] Saving updated state back to', STATE_URL);
    const saveRes = await fetch(STATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (!saveRes.ok) throw new Error(`POST failed: ${saveRes.status}`);
    const saveJson = await saveRes.json();
    console.log('[OK] Updated state saved. Changed entries:', changed, 'response:', saveJson);
    process.exit(0);
  } catch (err) {
    console.error('[ERROR]', err.message || err);
    process.exit(2);
  }
})();
