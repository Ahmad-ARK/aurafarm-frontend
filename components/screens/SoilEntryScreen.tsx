'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';

const API = 'https://aurafarm-production-1691.up.railway.app';

const TEXTURES = ['Sandy', 'Loamy', 'Clay', 'Sandy Loam', 'Clay Loam', 'Silty'];

type Props = {
    plotId: string;
    plotName: string;
    navigate: (s: string, data?: any) => void;
};

export default function SoilEntryScreen({ plotId, plotName, navigate }: Props) {
    const token = localStorage.getItem('token') || '';

    const [ph, setPh] = useState('');
    const [ec, setEc] = useState('');
    const [organicCarbon, setOrganic] = useState('');
    const [texture, setTexture] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit() {
        if (!ph) return setError('pH is required');

        const phVal = parseFloat(ph);
        if (isNaN(phVal) || phVal < 3 || phVal > 10) {
            return setError('pH must be between 3 and 10');
        }

        setLoading(true);
        setError('');

        const res = await fetch(`${API}/api/farm-plots/${plotId}/soil`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ph: phVal,
                ecDsm: ec ? parseFloat(ec) : undefined,
                organicCarbonPct: organicCarbon ? parseFloat(organicCarbon) : undefined,
                texture: texture || undefined,
            }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            navigate('plots');
        } else {
            setError(data.error || 'Failed to save soil data');
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '13px 14px',
        borderRadius: 12,
        border: `1px solid ${T.border}`,
        fontSize: 15,
        background: T.surface,
        color: T.text,
        boxSizing: 'border-box' as const,
        outline: 'none',
    };

    const labelStyle = {
        fontSize: 13,
        fontWeight: 500,
        color: T.muted,
        marginBottom: 6,
        display: 'block' as const,
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* Header */}
            <div style={{
                background: `linear-gradient(160deg, ${T.green900} 0%, ${T.green700} 100%)`,
                padding: '20px 20px 28px',
                color: 'white',
            }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Soil Lab Data</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{plotName}</div>
                <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
                    💡 Entering your lab test results gives the most accurate fertilizer recommendations. Only pH is required.
                </div>
            </div>

            <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {error && (
                    <div style={{ background: T.red100, color: T.red500, padding: '12px 14px', borderRadius: 10, fontSize: 13 }}>
                        {error}
                    </div>
                )}

                {/* pH — required */}
                <div>
                    <label style={labelStyle}>
                        Soil pH <span style={{ color: T.red500 }}>*</span>
                    </label>
                    <input
                        style={inputStyle}
                        type="number"
                        step="0.1"
                        placeholder="e.g. 7.8"
                        value={ph}
                        onChange={e => setPh(e.target.value)}
                    />
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                        Typical Punjab range: 7.5 – 8.5
                    </div>
                </div>

                {/* EC */}
                <div>
                    <label style={labelStyle}>
                        Electrical Conductivity (EC) <span style={{ color: T.placeholder }}>optional</span>
                    </label>
                    <input
                        style={inputStyle}
                        type="number"
                        step="0.01"
                        placeholder="e.g. 1.2 dS/m"
                        value={ec}
                        onChange={e => setEc(e.target.value)}
                    />
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                        Normal: &lt;2 dS/m · Saline: &gt;4 dS/m
                    </div>
                </div>

                {/* Organic Carbon */}
                <div>
                    <label style={labelStyle}>
                        Organic Carbon % <span style={{ color: T.placeholder }}>optional</span>
                    </label>
                    <input
                        style={inputStyle}
                        type="number"
                        step="0.1"
                        placeholder="e.g. 0.8"
                        value={organicCarbon}
                        onChange={e => setOrganic(e.target.value)}
                    />
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                        Low: &lt;0.5% · Medium: 0.5–1.5% · High: &gt;1.5%
                    </div>
                </div>

                {/* Texture */}
                <div>
                    <label style={labelStyle}>
                        Soil Texture <span style={{ color: T.placeholder }}>optional</span>
                    </label>
                    <select
                        style={inputStyle}
                        value={texture}
                        onChange={e => setTexture(e.target.value)}
                    >
                        <option value="">Select texture</option>
                        {TEXTURES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        background: loading ? T.muted : T.green800,
                        color: 'white',
                        border: 'none',
                        borderRadius: 14,
                        padding: '16px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: 4,
                    }}
                >
                    {loading ? 'Saving...' : 'Save Soil Data'}
                </button>

            </div>
        </div>
    );
}