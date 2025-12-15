import { io } from 'socket.io-client';

const URL = process.env.URL || 'http://localhost:4001';
console.log('[SOCKET TEST] Connecting to', URL);

const socket = io(URL, { reconnectionAttempts: 10 });

socket.on('connect', () => {
  console.log('[SOCKET TEST] connected', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[SOCKET TEST] disconnected', reason);
});

socket.on('timeLogCreated', (payload) => {
  console.log('[SOCKET TEST] timeLogCreated', payload);
});

socket.on('timeLogUpdated', (payload) => {
  console.log('[SOCKET TEST] timeLogUpdated', payload);
});

socket.on('timeLogsUpdated', (payload) => {
  console.log('[SOCKET TEST] timeLogsUpdated', Array.isArray(payload) ? `count=${payload.length}` : payload);
});

socket.on('stateUpdated', (state) => {
  console.log('[SOCKET TEST] stateUpdated: employees=', state?.employees?.length ?? 0, 'timeLogs=', state?.timeLogs?.length ?? 0);
});

socket.on('connect_error', (err) => {
  console.error('[SOCKET TEST] connect_error', err.message || err);
});

// Keep process alive
setTimeout(() => {
  console.log('[SOCKET TEST] timeout reached, exiting');
  socket.close();
  process.exit(0);
}, 30000);
