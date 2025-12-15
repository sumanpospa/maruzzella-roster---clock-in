#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function readDatabaseUrl() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return process.env.DATABASE_URL || null;
  const txt = fs.readFileSync(envPath, 'utf8');
  const m = txt.match(/DATABASE_URL\s*=\s*"?(.*?)"?\s*$/m);
  return m ? m[1] : process.env.DATABASE_URL || null;
}

(async () => {
  try {
    const connectionString = readDatabaseUrl();
    if (!connectionString) {
      console.error('[DB-CHECK] No DATABASE_URL found in server/.env or env');
      process.exit(2);
    }

    const client = new Client({ connectionString });
    await client.connect();
    console.log('[DB-CHECK] Connected to database');

    const tablesRes = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public' ORDER BY tablename");
    const tables = tablesRes.rows.map((r) => r.tablename);
    console.log('[DB-CHECK] Public tables:', tables.join(', '));

    const checkTables = ['"TimeLog"', '"Shift"', '"ShiftAssignment"'];
    for (const t of checkTables) {
      try {
        const r = await client.query(`SELECT count(*) as cnt FROM ${t}`);
        console.log(`[DB-CHECK] ${t} row count: ${r.rows[0].cnt}`);
      } catch (err) {
        console.log(`[DB-CHECK] ${t} check failed:`, err.message.replace(/\n/g, ' '));
      }
    }

    await client.end();
    console.log('[DB-CHECK] Done');
  } catch (err) {
    console.error('[DB-CHECK] Error', err.message || err);
    process.exit(1);
  }
})();
