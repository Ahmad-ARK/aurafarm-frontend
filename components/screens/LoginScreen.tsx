'use client';

import { useState } from "react";
import { T } from "@/lib/tokens";
import { useTranslation } from "@/lib/useTranslation";

export default function LoginScreen({ navigate }: { navigate: (s: string) => void }) {
    const { t } = useTranslation();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin() {
        if (!phone || !password) {
            setError(t('login_enter_both'));
            return;
        }

        setLoading(true);
        setError('');

        const res = await fetch('https://aurafarm-production-1691.up.railway.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone, password }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('farmerId', data.farmer.id);
            localStorage.setItem('farmerName', data.farmer.fullName);
            // Save language preference so useTranslation picks it up app-wide
            if (data.farmer.preferredLanguage) {
                localStorage.setItem('farmerLanguage', data.farmer.preferredLanguage);
            }
            navigate('dashboard');
        } else {
            setError(data.error || t('login_failed'));
        }
    }

    const inputStyle = {
        padding: '13px 14px',
        fontSize: 15,
        border: `1.5px solid ${T.border}`,
        borderRadius: 12,
        outline: 'none',
        background: T.surface,
        color: T.text,
        width: '100%',
        boxSizing: 'border-box' as const,
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* Green hero */}
            <div style={{
                background: `linear-gradient(160deg, ${T.green900} 0%, ${T.green700} 100%)`,
                padding: '48px 32px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
            }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>AuraFarm</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{t('login_tagline')}</div>
            </div>

            <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{t('login_welcome')}</div>

                {error && (
                    <div style={{
                        background: T.red100,
                        color: T.red500,
                        padding: '12px 14px',
                        borderRadius: 10,
                        fontSize: 13,
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>{t('login_phone')}</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="03001234567"
                        style={inputStyle}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>{t('login_password')}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={inputStyle}
                    />
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        background: loading ? T.muted : T.green800,
                        color: 'white',
                        border: 'none',
                        borderRadius: 14,
                        padding: '14px 20px',
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        width: '100%',
                    }}
                >
                    {loading ? t('login_signing_in') : t('login_sign_in')}
                </button>

                <div style={{ textAlign: 'center', fontSize: 14, color: T.muted, marginTop: 16 }}>
                    {t('login_no_account')}{' '}
                    <span
                        onClick={() => navigate('register')}
                        style={{ color: T.green800, fontWeight: 600, cursor: 'pointer' }}
                    >
                        {t('login_register')}
                    </span>
                </div>
            </div>
        </div>
    );
}
