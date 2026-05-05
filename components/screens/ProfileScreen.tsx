'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';

const API = 'https://aurafarm-production-1691.up.railway.app';

type Props = {
    navigate: (s: string, data?: { cycleId?: string }) => void;
};

export default function ProfileScreen({ navigate }: Props) {
    const token = localStorage.getItem('token') || '';
    const farmerId = localStorage.getItem('farmerId') || '';

    const [farmer, setFarmer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFarmer() {
            const res = await fetch(`${API}/api/farmers/${farmerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setFarmer(data);
            setLoading(false);
        }

        if (farmerId) loadFarmer();
    }, []);

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('farmerId');
        localStorage.removeItem('farmerName');
        navigate('login');
    }

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* Green header */}
            <div style={{
                background: `linear-gradient(160deg, ${T.green900} 0%, ${T.green700} 100%)`,
                padding: '32px 20px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: 'white',
            }}>
                {/* Avatar circle */}
                <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 700,
                    marginBottom: 12,
                }}>
                    {farmer?.fullName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{farmer?.fullName}</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{farmer?.phoneNumber}</div>
            </div>

            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Info card */}
                <div style={{
                    background: T.surface,
                    borderRadius: 16,
                    border: `1px solid ${T.border}`,
                    overflow: 'hidden',
                }}>
                    {[
                        { label: 'Province', value: farmer?.province || '—' },
                        { label: 'District', value: farmer?.district || '—' },
                        { label: 'Experience', value: farmer?.farmingExperienceYears ? `${farmer.farmingExperienceYears} years` : '—' },
                        { label: 'Language', value: farmer?.preferredLanguage || '—' },
                        { label: 'Total Plots', value: farmer?.plots?.length ?? 0 },
                    ].map((row, i, arr) => (
                        <div
                            key={row.label}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 16px',
                                borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
                            }}
                        >
                            <div style={{ fontSize: 13, color: T.muted }}>{row.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{row.value}</div>
                        </div>
                    ))}
                </div>

                {/* App info card */}
                <div style={{
                    background: T.surface,
                    borderRadius: 16,
                    border: `1px solid ${T.border}`,
                    overflow: 'hidden',
                }}>
                    {[
                        { label: 'App Version', value: '1.0.0' },
                        { label: 'Crop', value: 'Tomato (Pakistan)' },
                    ].map((row, i, arr) => (
                        <div
                            key={row.label}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 16px',
                                borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
                            }}
                        >
                            <div style={{ fontSize: 13, color: T.muted }}>{row.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{row.value}</div>
                        </div>
                    ))}
                </div>

                {/* Logout button */}
                <button
                    onClick={handleLogout}
                    style={{
                        background: T.red100,
                        color: T.red500,
                        border: 'none',
                        borderRadius: 14,
                        padding: '16px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: 4,
                    }}
                >
                    Log Out
                </button>

            </div>
        </div>
    );
}