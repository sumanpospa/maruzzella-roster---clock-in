import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('[BOOT] Starting Maruzzella backend with PostgreSQL (JSON storage)...');

// Initialize database tables on startup
async function initializeDatabase() {
  try {
    console.log('[DB] Checking database connection and schema...');
    await prisma.$connect();
    
    // Always ensure the Employee table exists with correct schema
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Employee" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "pin" TEXT NOT NULL,
        "department" TEXT NOT NULL DEFAULT 'Kitchen',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('[DB] Employee table verified/created');
    
    // Check if department column exists, add it if missing
    const checkColumn = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Employee' AND column_name = 'department'
    `;
    
    if (checkColumn.length === 0) {
      console.log('[DB] Department column missing, adding it...');
      await prisma.$executeRaw`
        ALTER TABLE "Employee" 
        ADD COLUMN "department" TEXT NOT NULL DEFAULT 'Kitchen'
      `;
      console.log('[DB] Department column added successfully');
    } else {
      console.log('[DB] Department column already exists');
    }
    
    // Update any existing rows that might have empty department
    await prisma.$executeRaw`
      UPDATE "Employee" 
      SET "department" = 'Kitchen' 
      WHERE "department" IS NULL OR "department" = ''
    `;
    
    console.log('[DB] Database schema verified successfully');
  } catch (error) {
    console.error('[DB] Database initialization error:', error.message);
    throw error;
  }
}

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

// Default state
const getDefaultState = () => ({
  employees: [
    { id: 1, name: 'Huda', role: 'Manager', pin: '1234', department: 'Kitchen' },
    { id: 2, name: 'Suman', role: 'Manager', pin: '1234', department: 'Kitchen' },
    { id: 3, name: 'Luca', role: 'Chef', pin: '1234', department: 'Kitchen' },
    { id: 4, name: 'Dennis', role: 'Chef', pin: '1234', department: 'Kitchen' },
    { id: 5, name: 'Enrico', role: 'Waiter', pin: '1234', department: 'Kitchen' },
    { id: 6, name: 'Sundesh', role: 'Waiter', pin: '1234', department: 'Kitchen' },
    { id: 7, name: 'Siyam', role: 'Waiter', pin: '1234', department: 'Kitchen' },
    { id: 8, name: 'Taki', role: 'Waiter', pin: '1234', department: 'Kitchen' },
    { id: 9, name: 'Tanbir', role: 'Host', pin: '1234', department: 'Kitchen' },
    { id: 10, name: 'Progganur', role: 'Host', pin: '1234', department: 'Kitchen' },
  ],
  rosters: {
    currentWeek: {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
      Friday: [], Saturday: [], Sunday: []
    },
    nextWeek: {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
      Friday: [], Saturday: [], Sunday: []
    }
  },
  timeLogs: []
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Maruzzella backend (PostgreSQL - Simple Storage)' });
});

// GET /api/state
app.get('/api/state', async (req, res) => {
  try {
    // Try to get state from database
    const stateRecord = await prisma.employee.findFirst({
      where: { id: 999999 } // Special ID for state storage
    });

    if (stateRecord && stateRecord.pin) {
      // State is stored in the pin field as JSON
      const state = JSON.parse(stateRecord.pin);
      
      // Department-specific role mapping
      const DEPARTMENT_ROLES = {
        Kitchen: ['Manager', 'Chef', 'Cook'],
        FOH: ['Manager', 'Supervisor', 'Bar Tender', 'Waiter', 'Food Runner'],
        Stewarding: ['Manager', 'Kitchen Hand']
      };
      
      // Migration: Ensure all employees have department field and valid roles
      if (state.employees && Array.isArray(state.employees)) {
        state.employees = state.employees.map(emp => {
          const department = emp.department || 'Kitchen';
          const validRoles = DEPARTMENT_ROLES[department] || ['Manager'];
          
          // If role is invalid for department, set to Manager
          const role = validRoles.includes(emp.role) ? emp.role : 'Manager';
          
          return {
            ...emp,
            department,
            role
          };
        });
      }
      
      console.log('[DB] State retrieved from database');
      return res.json(state);
    }

    // No state found, return default
    console.log('[DB] No state found, returning default');
    res.json(getDefaultState());
  } catch (error) {
    console.error('[API ERROR] /api/state:', error);
    // Fallback to default state on error
    res.json(getDefaultState());
  }
});

// POST /api/state
app.post('/api/state', async (req, res) => {
  try {
    const state = req.body;
    
    // Store entire state as JSON in a special employee record
    await prisma.employee.upsert({
      where: { id: 999999 },
      update: {
        name: '_STATE_',
        role: 'System',
        pin: JSON.stringify(state)
      },
      create: {
        id: 999999,
        name: '_STATE_',
        role: 'System',
        pin: JSON.stringify(state)
      }
    });

    console.log('[DB] State saved successfully');
    res.json(state);
  } catch (error) {
    console.error('[API ERROR] /api/state POST:', error);
    res.status(500).json({ error: 'Failed to save state' });
  }
});

const BASE_PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '0.0.0.0';

async function startServer(port, remainingAttempts) {
  try {
    // Initialize database schema first
    await initializeDatabase();
    
    // Test database connection
    await prisma.$connect();
    console.log('[DB] Connected to PostgreSQL');
  } catch (error) {
    console.error('[DB WARN] Database connection failed:', error.message);
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
  console.log('[HEARTBEAT] Backend alive (PostgreSQL - Simple)');
}, 30000);
