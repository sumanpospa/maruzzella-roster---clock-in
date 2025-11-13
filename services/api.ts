const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

export async function getState() {
  const res = await fetch(`${API_BASE}/api/state`);
  if (!res.ok) {
    throw new Error(`Failed to fetch state: ${res.status}`);
  }
  return res.json();
}

export async function saveState(state: any) {
  const res = await fetch(`${API_BASE}/api/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  if (!res.ok) {
    throw new Error(`Failed to save state: ${res.status}`);
  }
  return res.json();
}
