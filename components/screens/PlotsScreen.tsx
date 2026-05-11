'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import Icon from '@/components/ui/Icon';

const FARMING_TYPE_LABEL: Record<string, string> = {
    OPEN_FIELD: 'Open Field',
    TUNNEL_SIMPLE: 'Simple Tunnel',
    TUNNEL_ADVANCED: 'Advanced Tunnel',
};

export default function PlotsScreen({ navigate }: { navigate: (s: string, data?: { cycleId?: string; plotId?: string; plotName?: string }) => void }) {
    const [plots, setPlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPlots() {
            const token = localStorage.getItem('token');
            const farmerId = localStorage.getItem('farmerId');

            const res = await fetch(
                `https://aurafarm-production-1691.up.railway.app/api/farm-plots/farmer/${farmerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = await res.json();
            if (res.ok) setPlots(data);
            setLoading(false);
        }

        loadPlots();
    }, []);

    async function handleDelete(plotId: string, plotName: string) {
        const confirmed = window.confirm(
            `Delete "${plotName}"?\n\nThis will also delete all crop cycles and data for this plot.`
        );
        if (!confirmed) return;

        const token = localStorage.getItem('token');
        const res = await fetch(
            `https://aurafarm-production-1691.up.railway.app/api/farm-plots/${plotId}`,
            {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (res.ok) {
            setPlots(prev => prev.filter(p => p.id !== plotId));
        } else {
            alert('Failed to delete plot. Please try again.');
        }
    }

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Summary bar */}
                <div style={{
                    background: T.green50,
                    borderRadius: 14,
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontSize: 13, color: T.muted }}>Total Plots</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: T.green800, marginTop: 2 }}>
                            {plots.length}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('add-plot')}
                        style={{
                            background: T.green800,
                            color: 'white',
                            border: 'none',
                            borderRadius: 12,
                            padding: '10px 16px',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <Icon name="plus" size={16} color="white" />
                        Add Plot
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', color: T.muted, padding: 32 }}>
                        Loading plots...
                    </div>
                )}

                {/* Empty state */}
                {!loading && plots.length === 0 && (
                    <div style={{
                        background: T.surface,
                        borderRadius: 16,
                        border: `1px solid ${T.border}`,
                        padding: '32px 16px',
                        textAlign: 'center',
                        color: T.muted,
                    }}>
                        <div style={{ fontSize: 14, marginBottom: 8 }}>No plots yet</div>
                        <span
                            onClick={() => navigate('add-plot')}
                            style={{ color: T.green800, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                        >
                            Add your first plot →
                        </span>
                    </div>
                )}

                {/* Plot cards */}
                {plots.map((plot: any) => (
                    <div
                        key={plot.id}
                        style={{
                            background: T.surface,
                            borderRadius: 16,
                            border: `1px solid ${T.border}`,
                            padding: '16px',
                            cursor: 'pointer',
                        }}
                        onClick={async () => {
                            const token = localStorage.getItem('token');
                            const res = await fetch(
                                `https://aurafarm-production-1691.up.railway.app/api/crop-cycles/plot/${plot.id}`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            const cycles = await res.json();
                            const active = cycles.find((c: any) => c.status === 'ACTIVE');
                            if (active) {
                                navigate('cycle-detail', { cycleId: active.id });
                            } else {
                                navigate('start-cycle');
                            }
                        }}
                    >
                        {/* Top row — name + delete button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{plot.plotName}</div>
                                    {plot.cycles?.length > 0 && (
                                        <div style={{
                                            background: T.green800,
                                            color: 'white',
                                            fontSize: 10,
                                            fontWeight: 700,
                                            padding: '2px 7px',
                                            borderRadius: 20,
                                            letterSpacing: 0.3,
                                        }}>
                                            ACTIVE
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                                    {plot.areaAcres} acres · {FARMING_TYPE_LABEL[plot.farmingTypeId] || plot.farmingTypeId}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleDelete(plot.id, plot.plotName);
                                    }}
                                    style={{
                                        background: T.red100,
                                        color: T.red500,
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '6px 10px',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Delete
                                </button>
                                <Icon name="chevronRight" size={18} color={T.muted} />
                            </div>
                        </div>

                        {/* Bottom row — water source + soil data + start cycle */}
                        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                            <div style={{
                                flex: 1,
                                background: T.green50,
                                borderRadius: 10,
                                padding: '8px 10px',
                                fontSize: 12,
                                color: T.green700,
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                            }}>
                                <Icon name="cloud" size={12} color={T.green700} />
                                {plot.irrigationSourceId}
                            </div>
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    navigate('soil-entry', { plotId: plot.id, plotName: plot.plotName });
                                }}
                                style={{
                                    background: plot.soilData?.length > 0 ? T.green50 : T.surface,
                                    color: T.green800,
                                    border: `1px solid ${T.green800}`,
                                    borderRadius: 10,
                                    padding: '8px 14px',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                }}
                            >
                                {plot.soilData?.length > 0 && (
                                    <Icon name="check" size={11} color={T.green800} />
                                )}
                                Soil Data
                            </button>
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    navigate('start-cycle', { plotId: plot.id });
                                }}
                                style={{
                                    background: T.green800,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '8px 14px',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Start Cycle
                            </button>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}