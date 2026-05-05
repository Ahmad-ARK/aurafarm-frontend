'use client';

import { useState } from "react";
import { T } from "@/lib/tokens";

export default function LoginScreen({ navigate }: { navigate: (s: string) => void }) {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin() {
        const res = await fetch('https://aurafarm-production-1691.up.railway.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone, password: password }),
        });

        const data = await res.json();
        console.log('response:', res.ok, data);

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('farmerId', data.farmer.id);
            localStorage.setItem('farmerName', data.farmer.fullName);
            navigate('dashboard');
        } else {
            alert(data.error || 'Login failed');
        }

    }


    return (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Green hero at top */}
            <div style={{
                background: `linear-gradient(160deg, ${T.green900} 0%, ${T.green700} 100%)`,
                padding: '48px 32px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12
            }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>AuraFarm</div>
                <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }}>Smart agricultural decision support</div>
            </div>

            {/**Form */}
            <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>Welcome back</div>
                {/* Phone input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="03001234567"
                        style={{
                            padding: '13px 14px',
                            fontSize: 15,
                            border: `1.5px solid ${T.border}`,
                            borderRadius: 12,
                            outline: 'none',
                            background: T.surface,
                            color: T.text,
                        }}
                    />
                </div>

                {/* Password input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password"
                        style={{
                            padding: '13px 14px',
                            fontSize: 15,
                            border: `1.5px solid ${T.border}`,
                            borderRadius: 12,
                            outline: 'none',
                            background: T.surface,
                            color: T.text,
                        }}
                    />
                </div>

                {/* Sign in button */}
                <button
                    onClick={handleLogin}
                    style={{
                        background: T.green800,
                        color: 'white',
                        border: 'none',
                        borderRadius: 14,
                        padding: '14px 20px',
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: 'pointer',
                        width: '100%',
                    }}
                >
                    Sign In
                </button>

                {/* Register link */}
                <div style={{ textAlign: 'center', fontSize: 14, color: T.muted, marginTop: 16 }}>
                    Don't have an account?{' '}
                    <span
                        onClick={() => navigate('register')}
                        style={{ color: T.green800, fontWeight: 600, cursor: 'pointer' }}
                    >
                        Register
                    </span>
                </div>
            </div>
        </div>
    );
}