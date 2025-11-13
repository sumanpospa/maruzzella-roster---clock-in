import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();

// CORS configuration - allow frontend URL from env or localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL || 'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

const DATA_FILE = path.join(process.cwd(), 'data.json');

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
  console.log('GET /api/state');
  const d = readData();
  res.json(d);
});

app.post('/api/state', (req, res) => {
  console.log('POST /api/state with', req.body?.employees?.length || 0, 'employees');
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Maruzzella backend running on http://localhost:${PORT}`);
  // Initialize data on startup
  readData();
});
