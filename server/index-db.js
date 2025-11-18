import express from 'express';
import cors from 'cors';
import prisma, { initializeDatabase, convertShiftsToRoster, saveRosterToDatabase } from './db.js';

console.log('[BOOT] Starting Maruzzella backend with PostgreSQL...');

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

const app = express();

// CORS configuration
const envOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',').map(s => s.trim()) : [])
].filter(Boolean);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  ...envOrigins
];

const vercelPattern = /^https?:\/\/([a-z0-9-]+\.)*vercel\.app$/i;

app.use(cors({
  origin: function (origin, callback) {
    const isDev = process.env.NODE_ENV !== 'production';
    const allowLan = /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin || '');

    if (
      !origin ||
      isDev ||
      allowedOrigins.includes(origin) ||
      allowLan ||
      vercelPattern.test(origin || '')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204
}));

app.options('*', cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Maruzzella backend (PostgreSQL)' });
});

// GET /api/state - Return current state from database
app.get('/api/state', async (req, res) => {
  try {
    // Get employees
    const employees = await prisma.employee.findMany({
      orderBy: { id: 'asc' }
    });

    // Get shifts with their employees
    const shifts = await prisma.shift.findMany({
      include: {
        employees: true
      }
    });

    // Get time logs
    const timeLogs = await prisma.timeLog.findMany({
      include: {
        employee: true
      },
      orderBy: { clockIn: 'desc' }
    });

    // Convert to frontend format
    const rosters = convertShiftsToRoster(shifts);

    const formattedTimeLogs = timeLogs.map(log => ({
      id: log.id,
      employeeId: log.employeeId,
      clockInTime: log.clockIn,
      clockOutTime: log.clockOut,
    }));

    res.json({
      employees,
      rosters,
      timeLogs: formattedTimeLogs
    });
  } catch (error) {
    console.error('[API ERROR] /api/state:', error);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});

// POST /api/state - Save state to database
app.post('/api/state', async (req, res) => {
  try {
    const { employees, rosters, timeLogs } = req.body;

    // Save employees
    if (employees) {
      for (const emp of employees) {
        await prisma.employee.upsert({
          where: { id: emp.id },
          update: {
            name: emp.name,
            role: emp.role,
            pin: emp.pin
          },
          create: {
            id: emp.id,
            name: emp.name,
            role: emp.role,
            pin: emp.pin
          }
        });
      }
    }

    // Save rosters
    if (rosters) {
      await saveRosterToDatabase(rosters);
    }

    // Save time logs
    if (timeLogs) {
      for (const log of timeLogs) {
        if (log.id) {
          await prisma.timeLog.upsert({
            where: { id: log.id },
            update: {
              clockIn: new Date(log.clockInTime),
              clockOut: log.clockOutTime ? new Date(log.clockOutTime) : null,
              date: new Date(log.clockInTime).toISOString().split('T')[0]
            },
            create: {
              id: log.id,
              employeeId: log.employeeId,
              clockIn: new Date(log.clockInTime),
              clockOut: log.clockOutTime ? new Date(log.clockOutTime) : null,
              date: new Date(log.clockInTime).toISOString().split('T')[0]
            }
          });
        }
      }
    }

    console.log('[DB] State saved successfully');
    
    // Return updated state
    const updatedEmployees = await prisma.employee.findMany({ orderBy: { id: 'asc' } });
    const updatedShifts = await prisma.shift.findMany({ include: { employees: true } });
    const updatedTimeLogs = await prisma.timeLog.findMany({ 
      include: { employee: true },
      orderBy: { clockIn: 'desc' }
    });

    res.json({
      employees: updatedEmployees,
      rosters: convertShiftsToRoster(updatedShifts),
      timeLogs: updatedTimeLogs.map(log => ({
        id: log.id,
        employeeId: log.employeeId,
        clockInTime: log.clockIn,
        clockOutTime: log.clockOut,
      }))
    });
  } catch (error) {
    console.error('[API ERROR] /api/state POST:', error);
    res.status(500).json({ error: 'Failed to save state' });
  }
});

const BASE_PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '0.0.0.0';

async function startServer(port, remainingAttempts) {
  // Initialize database first
  try {
    await initializeDatabase();
    console.log('[DB] Database initialized successfully');
  } catch (error) {
    console.error('[DB FATAL] Failed to initialize database:', error);
    process.exit(1);
  }

  const server = app.listen(port, HOST, () => {
    console.log(`[LISTEN] Maruzzella backend running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${port}`);
    if (port !== BASE_PORT) {
      console.log(`[INFO] Original PORT ${BASE_PORT} was busy; using fallback ${port}.`);
    }
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

startServer(BASE_PORT, 15);

process.on('exit', (code) => {
  console.log('[PROCESS EXIT] Code:', code);
  prisma.$disconnect();
});

setInterval(() => {
  console.log('[HEARTBEAT] Backend alive (PostgreSQL)');
}, 30000);
