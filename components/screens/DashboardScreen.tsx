'use client';

import { useState, useEffect } from "react";
import { T } from "@/lib/tokens";
import Icon from '@/components/ui/Icon';

export default function DashboardScreen({ navigate }: { navigate: (s: string, data?: { cycleId?: string }) => void }) {
    const farmerName = localStorage.getItem('farmerName') || 'Farmer';
    const farmerId = localStorage.getItem('farmerId') || '';
    const token = localStorage.getItem('token') || '';

    const [cycles, setCycles] = useState<any[]>([]);
    const [weather, setWeather] = useState<any>(null);

    useEffect(() => {
        async function loadCycles() {
            const res = await fetch('https://aurafarm-production-1691.up.railway.app/api/crop-cycles/active', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                // Only show this farmer's cycles
                const mine = data.filter((c: any) => c.plot?.farmerId === farmerId);
                setCycles(mine);
            }
        }
        async function loadWeather() {
            const farmerId = localStorage.getItem('farmerId') || '';
            const plotsRes = await fetch(
                `https://aurafarm-production-1691.up.railway.app/api/farm-plots/farmer/${farmerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const plots = await plotsRes.json();
            if (!plotsRes.ok || plots.length === 0) return;

            const weatherRes = await fetch(
                `https://aurafarm-production-1691.up.railway.app/api/weather?lat=${plots[0].latitude}&lng=${plots[0].longitude}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await weatherRes.json();
            if (weatherRes.ok && data.length > 0) setWeather(data[0]);
        }
        loadWeather();
        loadCycles();
    }, []);

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Green header */}
            <div style={{
                background: `linear-gradient(160deg, ${T.green900} 0%, ${T.green700} 100%)`,
                padding: '48px 20px 24px',
            }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Good morning</div>
                <div style={{ color: 'white', fontSize: 20, fontWeight: 700, marginTop: 2 }}>{farmerName}</div>

                {/* Weather card */}
                <div
                    onClick={() => navigate('weather')}
                    style={{
                        marginTop: 18,
                        background: 'rgba(255,255,255,0.12)',
                        borderRadius: 14,
                        padding: '12px 16px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {weather ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ fontSize: 28 }}>
                                    <Icon name={weather.rainfallMm > 5 ? 'cloudRain' : weather.humidityPct > 80 ? 'cloud' : 'sun'} size={28} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 700 }}>{Math.round(weather.tempAvgC)}°C</div>
                                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                                        {Math.round(weather.tempMinC)}° – {Math.round(weather.tempMaxC)}° · {weather.humidityPct}% humidity
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.7 }}>7-day ›</div>
                        </>
                    ) : (
                        <div style={{ fontSize: 14, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="sun" size={16} color="white" /> Add a plot to see weather
                        </div>
                    )}
                </div>
            </div>

            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Active Cycles */}
                <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 12 }}>
                        Active Cycles
                    </div>

                    {cycles.length === 0 ? (
                        <div style={{
                            background: T.surface,
                            borderRadius: 16,
                            border: `1px solid ${T.border}`,
                            padding: '24px 16px',
                            textAlign: 'center',
                            color: T.muted,
                            fontSize: 14,
                        }}>
                            No active cycles yet.{' '}
                            <span
                                onClick={() => navigate('start-cycle')}
                                style={{ color: T.green800, fontWeight: 600, cursor: 'pointer' }}
                            >
                                Start one →
                            </span>
                        </div>
                    ) : (
                        cycles.map((cycle: any) => (
                            <div
                                key={cycle.id}
                                onClick={() => navigate('cycle-detail', { cycleId: cycle.id })}
                                style={{
                                    background: T.surface,
                                    borderRadius: 16,
                                    border: `1px solid ${T.border}`,
                                    padding: '14px 16px',
                                    marginBottom: 10,
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>
                                    {cycle.crop?.name || 'Crop Cycle'}
                                </div>
                                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                                    {cycle.plot?.plotName || 'Plot'}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Quick Actions */}
                <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 12 }}>
                        Quick Actions
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                            { label: 'Add New Plot', screen: 'add-plot' },
                            { label: 'Start Cycle', screen: 'start-cycle' },
                            { label: 'My Plots', screen: 'plots' },
                            { label: 'Weather', screen: 'weather', icon: 'sun' },
                        ].map((action) => (
                            <div
                                key={action.screen}
                                onClick={() => navigate(action.screen)}
                                style={{
                                    background: T.surface,
                                    borderRadius: 16,
                                    border: `1px solid ${T.border}`,
                                    padding: '16px',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: T.text,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {(action as any).icon && <Icon name={(action as any).icon} size={16} color={T.text} />}
                                    {action.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Crop Recommendations */}
                <div
                    onClick={() => navigate('crop-recs')}
                    style={{
                        background: T.surface,
                        border: `1.5px solid ${T.border}`,
                        borderRadius: 14,
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="calendar" size={16} color={T.text} /> Crop Recommendations
                        </div>
                        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                            Best crops to plant this month in your region
                        </div>
                    </div>
                    <div style={{ fontSize: 20, color: T.muted }}>›</div>
                </div>

            </div>
        </div>
    );
}