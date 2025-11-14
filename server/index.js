import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// Debug startup banner
console.log('[BOOT] Starting Maruzzella backend...');

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

const app = express();

// CORS configuration - allow frontend URL from env or localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL || 'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    const isDev = process.env.NODE_ENV !== 'production';
    const allowLan = /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin || '');
    // Allow localhost, LAN IPs, or anything in non-production
    if (!origin || allowedOrigins.includes(origin) || allowLan || isDev) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204
}));

// Ensure preflight requests are handled
app.options('*', cors());
app.use(express.json());

// Persist state at server/data.json relative to project root
const DATA_FILE = path.join(process.cwd(), 'server', 'data.json');
console.log('[CONFIG] DATA_FILE resolved to:', DATA_FILE);

// Health check / root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Maruzzella backend' });
});

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    // If data is empty, seed with initial state
    if ((!data.employees || data.employees.length === 0) && !data._seeded) {
      console.log('Seeding backend with initial data...');
      const initialData = {
        employees: [
          { id: 1, name: 'Huda', role: 'Manager', pin: '1234' },
          { id: 2, name: 'Suman', role: 'Manager', pin: '1234' },
          { id: 3, name: 'Luca', role: 'Chef', pin: '1234' },
          { id: 4, name: 'Dennis', role: 'Chef', pin: '1234' },
          { id: 5, name: 'Enrico', role: 'Chef', pin: '1234' },
          { id: 6, name: 'Sundesh', role: 'Chef', pin: '1234' },
          { id: 7, name: 'Siyam', role: 'Chef', pin: '1234' },
          { id: 8, name: 'Taki', role: 'Chef', pin: '1234' },
          { id: 9, name: 'Tanbir', role: 'Chef', pin: '1234' },
          { id: 10, name: 'Progganur', role: 'Chef', pin: '1234' },
        ],
        rosters: {
          currentWeek: {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
          },
          nextWeek: {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
          }
        },
        timeLogs: [],
        _seeded: true
      };
      writeData(initialData);
      return initialData;
    }
    return data;
  } catch (err) {
    console.log('No data file found, creating initial data...');
    const initialData = {
      employees: [
        { id: 1, name: 'Huda', role: 'Manager', pin: '1234' },
        { id: 2, name: 'Suman', role: 'Manager', pin: '1234' },
        { id: 3, name: 'Luca', role: 'Chef', pin: '1234' },
        { id: 4, name: 'Dennis', role: 'Chef', pin: '1234' },
        { id: 5, name: 'Enrico', role: 'Chef', pin: '1234' },
        { id: 6, name: 'Sundesh', role: 'Chef', pin: '1234' },
        { id: 7, name: 'Siyam', role: 'Chef', pin: '1234' },
        { id: 8, name: 'Taki', role: 'Chef', pin: '1234' },
        { id: 9, name: 'Tanbir', role: 'Chef', pin: '1234' },
        { id: 10, name: 'Progganur', role: 'Chef', pin: '1234' },
      ],
      rosters: {
        currentWeek: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: []
        },
        nextWeek: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: []
        }
      },
      timeLogs: [],
      _seeded: true
    };
    writeData(initialData);
    return initialData;
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write data file', err);
    return false;
  }
}

app.get('/api/state', (req, res) => {
  console.log('[REQ] GET /api/state');
  const d = readData();
  res.json(d);
});

app.post('/api/state', (req, res) => {
  console.log('[REQ] POST /api/state with', req.body?.employees?.length || 0, 'employees');
  const payload = req.body || {};
  const existing = readData();
  const merged = {
    employees: Array.isArray(payload.employees) ? payload.employees : existing.employees || [],
    rosters: payload.rosters !== undefined ? payload.rosters : existing.rosters,
    timeLogs: Array.isArray(payload.timeLogs) ? payload.timeLogs : existing.timeLogs || [],
  };
  const ok = writeData(merged);
  if (!ok) return res.status(500).json({ error: 'Failed to persist data' });
  return res.json(merged);
});

const BASE_PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '0.0.0.0';

function startServer(port, remainingAttempts) {
  const server = app.listen(port, HOST, () => {
    console.log(`[LISTEN] Maruzzella backend running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${port}`);
    if (port !== BASE_PORT) {
      console.log(`[INFO] Original PORT ${BASE_PORT} was busy; using fallback ${port}.`);
    }
    readData();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[WARN] Port ${port} in use.`);
      if (remainingAttempts > 0) {
        const nextPort = port + 1;
        console.log(`[RETRY] Trying port ${nextPort} (attempts left: ${remainingAttempts - 1}).`);
        startServer(nextPort, remainingAttempts - 1);
      } else {
        console.error('[FATAL] Exhausted port attempts. Aborting.');
        process.exit(1);
      }
    } else {
      console.error('[FATAL] Server error:', err);
      process.exit(1);
    }
  });

  server.on('close', () => {
    console.log('[EVENT] Server close event fired.');
  });
}

startServer(BASE_PORT, 15); // Up to 16 ports including base

process.on('exit', (code) => {
  console.log('[PROCESS EXIT] Code:', code);
});

setInterval(() => {
  // Heartbeat so we can see the process is alive every 30s
  console.log('[HEARTBEAT] Backend alive');
}, 30000);
