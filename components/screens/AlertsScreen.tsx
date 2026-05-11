'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import Icon from '@/components/ui/Icon';
import { useTranslation } from "@/lib/useTranslation";

const API = 'https://aurafarm-production-1691.up.railway.app';

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    CRITICAL: { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' },
    HIGH:     { bg: '#FFF3E0', text: '#E65100', border: '#FFB74D' },
    WARNING:  { bg: '#FFFDE7', text: '#F57F17', border: '#FFF176' },
};

// Maps DB diseaseId (SNAKE_CASE) → Urdu display name
const DISEASE_URDU: Record<string, string> = {
    LATE_BLIGHT:          'پچھیتا جھلساؤ',
    EARLY_BLIGHT:         'اگیتا جھلساؤ',
    BACTERIAL_SPOT:       'بیکٹیریائی دھبے',
    LEAF_MOLD:            'پتے کی پھپھوندی',
    SEPTORIA_LEAF_SPOT:   'سیپٹوریا دھبے',
    SPIDER_MITES:         'سُرخ مکڑی',
    TARGET_SPOT:          'ہدف دھبہ',
    MOSAIC_VIRUS:         'موزیک وائرس',
    YELLOW_LEAF_CURL_VIRUS: 'پیلا پتہ موڑ وائرس',
};

// Maps DB pathogenType → translation key suffix
const PATHOGEN_KEY: Record<string, string> = {
    Fungal: 'fungal', Bacterial: 'bacterial',
    Viral: 'viral', Pest: 'pest',
};

type Props = {
    navigate: (s: string, data?: { cycleId?: string }) => void;
};

export default function AlertsScreen({ navigate }: Props) {
    const { t } = useTranslation();
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
                {t('alerts_loading')}
            </div>
        );
    }

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{t('alerts_title')}</div>
                    {alerts.length > 0 && (
                        <div style={{
                            background: T.red100,
                            color: T.red500,
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 20,
                        }}>
                            {t('alerts_active', { count: alerts.length })}
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
                            {t('alerts_no_active')}
                        </div>
                        <div style={{ fontSize: 13, color: T.muted }}>
                            {t('alerts_healthy')}
                        </div>
                    </div>
                )}

                {/* Alert cards */}
                {alerts.map((alert: any) => {
                    const colors = LEVEL_COLORS[alert.alertLevel] || LEVEL_COLORS.WARNING;
                    const date = new Date(alert.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short',
                    });
                    const urduName = DISEASE_URDU[alert.diseaseId] || alert.disease?.diseaseName || alert.diseaseId;
                    const pathogenKey = PATHOGEN_KEY[alert.disease?.pathogenType];
                    const pathogenLabel = pathogenKey ? t(`pathogen_${pathogenKey}` as any) : alert.disease?.pathogenType;
                    const levelLabel = t(`alert_level_${alert.alertLevel}` as any) || alert.alertLevel;

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
                                    {levelLabel}
                                </div>
                                <div style={{ fontSize: 12, color: T.muted }}>{date}</div>
                            </div>

                            {/* Disease name in Urdu */}
                            <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                                {urduName}
                            </div>

                            {/* Pathogen type translated */}
                            {pathogenLabel && (
                                <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>
                                    {pathogenLabel}
                                </div>
                            )}

                            {/* Plot + trigger conditions */}
                            <div style={{ fontSize: 12, color: T.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Icon name="mapPin" size={12} color={T.muted} />
                                <span>
                                    {alert.cycle?.plot?.plotName || '—'} · {Number(alert.triggerTempC).toFixed(1)}°C · {t('weather_humidity')} {Number(alert.triggerHumidityPct).toFixed(0)}%
                                </span>
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
                                    {t('alerts_view_cycle')}
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
                                    {t('alerts_dismiss')}
                                </button>
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}