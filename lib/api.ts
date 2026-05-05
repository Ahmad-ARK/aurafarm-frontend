const BASE = 'https://aurafarm-production-1691.up.railway.app';

function token() {
    return localStorage.getItem('token');
}

export async function loginApi(phoneNumber: string, password: string) {
    const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
    });
    return res.json();
}

export async function registerApi(data: object) {
    const res = await fetch(`${BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function getPlotsApi(farmerId: string) {
    const res = await fetch(`${BASE}/api/farm-plots/farmer/${farmerId}`, {
        headers: { Authorization: `Bearer ${token()}` },
    });
    return res.json();
}