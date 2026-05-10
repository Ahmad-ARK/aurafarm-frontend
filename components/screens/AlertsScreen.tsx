'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import Icon from '@/components/ui/Icon';

const API = 'https://aurafarm-production-1691.up.railway.app';

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    CRITICAL: { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' },
    HIGH: { bg: '#FFF3E0', text: '#E65100', border: '#FFB74D' },
    WARNING: { bg: '#FFFDE7', text: '#F57F17', border: '#FFF176' },
};

type Props = {
    navigate: (s: string, data?: { cycleId?: string }) => void;
};

export default function AlertsScreen({ navigate }: Props) {
    const token = localStorage.getItem('token') || '';
    const farmerId = localStorage.getItem('farmerId') || '';

    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlerts();
    }, []);

    async function loadAlerts() {
        const res = await fetch(`${API}/api/crop-cycles/farmer/${farmerId}/alerts`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setAlerts(data);
        setLoading(false);
    }

    async function handleDismiss(alertId: string) {
        await fetch(`${API}/api/crop-cycles/alerts/${alertId}/dismiss`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
        });
        // Remove from list immediately without refetching
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    }

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                Loading alerts...
            </div>
        );
    }

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>Disease Alerts</div>
                    {alerts.length > 0 && (
                        <div style={{
                            background: T.red100,
                            color: T.red500,
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 20,
                        }}>
                            {alerts.length} active
                        </div>
                    )}
                </div>

                {/* Empty state */}
                {alerts.length === 0 && (
                    <div style={{
                        background: T.surface,
                        borderRadius: 16,
                        border: `1px solid ${T.border}`,
                        padding: '40px 20px',
                        textAlign: 'center',
                    }}>
                        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                            <div style={{ background: T.green800, borderRadius: 14, padding: 10 }}>
                                <Icon name="check" size={32} color="white" />
                            </div>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 6 }}>
                            No active alerts
                        </div>
                        <div style={{ fontSize: 13, color: T.muted }}>
                            Your crops look healthy. We'll notify you if any disease risk is detected.
                        </div>
                    </div>
                )}

                {/* Alert cards */}
                {alerts.map((alert: any) => {
                    const colors = LEVEL_COLORS[alert.alertLevel] || LEVEL_COLORS.WARNING;
                    const date = new Date(alert.createdAt).toLocaleDateString('en-PK', {
                        day: 'numeric', month: 'short',
                    });

                    return (
                        <div
                            key={alert.id}
                            style={{
                                background: colors.bg,
                                borderRadius: 16,
                                border: `1px solid ${colors.border}`,
                                padding: '16px',
                            }}
                        >
                            {/* Top row: level badge + date */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div style={{
                                    background: colors.text,
                                    color: 'white',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    letterSpacing: 0.5,
                                }}>
                                    {alert.alertLevel}
                                </div>
                                <div style={{ fontSize: 12, color: T.muted }}>{date}</div>
                            </div>

                            {/* Disease name */}
                            <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                                {alert.disease?.diseaseName || alert.diseaseId}
                            </div>

                            {/* Scientific name */}
                            {alert.disease?.pathogenType && (
                                <div style={{ fontSize: 12, color: T.muted, fontStyle: 'italic', marginBottom: 8 }}>
                                    {alert.disease.pathogenType}
                                </div>
                            )}

                            {/* Plot + cycle */}
                            <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <Icon name="mapPin" size={12} color={T.muted} />
                                    {alert.cycle?.plot?.plotName || 'Plot'} · triggered at
                                </span> {Number(alert.triggerTempC).toFixed(1)}°C, {Number(alert.triggerHumidityPct).toFixed(0)}% humidity
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => navigate('cycle-detail', { cycleId: alert.cycleId })}
                                    style={{
                                        flex: 1,
                                        background: colors.text,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 10,
                                        padding: '10px',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    View Cycle
                                </button>
                                <button
                                    onClick={() => handleDismiss(alert.id)}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        color: colors.text,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 10,
                                        padding: '10px',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}