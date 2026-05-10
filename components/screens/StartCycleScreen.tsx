'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';

const API = 'https://aurafarm-production-1691.up.railway.app';

// Valid transplant months (1-indexed) per farming type — Pakistan tomato seasons
const SEASONAL_WINDOWS: Record<string, number[]> = {
    OPEN_FIELD:      [2, 3, 7, 8],            // Feb–Mar (spring), Jul–Aug (autumn)
    TUNNEL_SIMPLE:   [1, 2, 3, 4, 7, 8, 9],   // Jan–Apr, Jul–Sep
    TUNNEL_ADVANCED: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12], // almost year-round
};

const FARMING_TYPE_LABEL: Record<string, string> = {
    OPEN_FIELD:      'Open Field',
    TUNNEL_SIMPLE:   'Simple Tunnel (Low Tunnel)',
    TUNNEL_ADVANCED: 'Advanced Tunnel (High Tunnel)',
};

const MONTH_NAMES = [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function getSeasonalWarning(
    farmingTypeId: string,
    month: number,
): { message: string; suggestion: string } | null {
    if (!farmingTypeId || !month) return null;
    const windows = SEASONAL_WINDOWS[farmingTypeId];
    if (!windows || windows.includes(month)) return null;

    const validNames = windows.map(m => MONTH_NAMES[m]).join(', ');
    let suggestion = '';

    if (farmingTypeId === 'OPEN_FIELD') {
        const simpleExtra = SEASONAL_WINDOWS.TUNNEL_SIMPLE
            .filter(m => !windows.includes(m))
            .map(m => MONTH_NAMES[m]).join(', ');
        const advExtra = SEASONAL_WINDOWS.TUNNEL_ADVANCED
            .map(m => MONTH_NAMES[m]).join(', ');
        suggestion =
            `Simple Tunnel adds: ${simpleExtra}\n` +
            `Advanced Tunnel covers: ${advExtra}`;
    } else if (farmingTypeId === 'TUNNEL_SIMPLE') {
        const advExtra = SEASONAL_WINDOWS.TUNNEL_ADVANCED
            .filter(m => !windows.includes(m))
            .map(m => MONTH_NAMES[m]).join(', ');
        suggestion = `Advanced Tunnel adds: ${advExtra}`;
    }

    return {
        message: `${MONTH_NAMES[month]} is outside the recommended window for ${FARMING_TYPE_LABEL[farmingTypeId] || farmingTypeId}. Optimal months: ${validNames}.`,
        suggestion,
    };
}

export default function StartCycleScreen({ navigate }: { navigate: (s: string) => void }) {
    const [plots, setPlots] = useState<any[]>([]);
    const [selectedPlot, setSelectedPlot] = useState('');
    const [npkTier, setNpkTier] = useState('TOMATO_COMMERCIAL');
    const [transplantDate, setTransplantDate] = useState('');
    const [previousCrop, setPreviousCrop] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadPlots() {
            const token = localStorage.getItem('token');
            const farmerId = localStorage.getItem('farmerId');
            const res = await fetch(
                `${API}/api/farm-plots/farmer/${farmerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (res.ok) {
                setPlots(data);
                if (data.length > 0) setSelectedPlot(data[0].id);
            }
        }
        loadPlots();
    }, []);

    async function handleStart() {
        if (!selectedPlot || !transplantDate) {
            alert('Please select a plot and transplant date');
            return;
        }
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/api/crop-cycles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                plotId: selectedPlot,
                cropId: 'TOMATO',
                npkTierId: npkTier,
                transplantDate: transplantDate,
                previousCropId: previousCrop || undefined,
            }),
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok) {
            navigate('plots');
        } else {
            alert(data.error || 'Failed to start cycle');
        }
    }

    // Derive farming type from selected plot
    const selectedPlotObj = plots.find(p => p.id === selectedPlot);
    const farmingTypeId: string = selectedPlotObj?.farmingType?.id || '';

    // Off-season check
    const transplantMonth = transplantDate ? new Date(transplantDate).getMonth() + 1 : 0;
    const seasonalWarning = transplantDate ? getSeasonalWarning(farmingTypeId, transplantMonth) : null;

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Info banner */}
                <div style={{
                    background: T.green50,
                    borderRadius: 14,
                    padding: '14px 16px',
                    fontSize: 13,
                    color: T.green700,
                    lineHeight: 1.5,
                }}>
                    Starting a cycle will generate fertilizer recommendations for each growth stage and activate disease monitoring.
                </div>

                {/* Plot selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>Select Plot</label>
                    <select
                        value={selectedPlot}
                        onChange={e => setSelectedPlot(e.target.value)}
                        style={{
                            padding: '13px 14px', fontSize: 15,
                            border: `1.5px solid ${T.border}`, borderRadius: 12,
                            outline: 'none', background: T.surface, color: T.text,
                        }}
                    >
                        {plots.map(plot => (
                            <option key={plot.id} value={plot.id}>{plot.plotName}</option>
                        ))}
                    </select>
                    {/* Show farming type as a hint */}
                    {farmingTypeId && (
                        <div style={{ fontSize: 12, color: T.muted, paddingLeft: 2 }}>
                            📍 {FARMING_TYPE_LABEL[farmingTypeId] || farmingTypeId}
                        </div>
                    )}
                </div>

                {/* Crop — fixed to Tomato for now */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>Crop</label>
                    <div style={{
                        padding: '13px 14px', fontSize: 15,
                        border: `1.5px solid ${T.border}`, borderRadius: 12,
                        background: '#F9F9F9', color: T.muted,
                    }}>
                        🍅 Tomato
                    </div>
                </div>

                {/* NPK Tier */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>Farming Level</label>
                    <select
                        value={npkTier}
                        onChange={e => setNpkTier(e.target.value)}
                        style={{
                            padding: '13px 14px', fontSize: 15,
                            border: `1.5px solid ${T.border}`, borderRadius: 12,
                            outline: 'none', background: T.surface, color: T.text,
                        }}
                    >
                        <option value="TOMATO_COMMERCIAL">Commercial (High yield target)</option>
                        <option value="TOMATO_EXTENSION">Extension (Standard)</option>
                    </select>
                </div>

                {/* Transplant Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>Transplant Date</label>
                    <input
                        type="date"
                        value={transplantDate}
                        onChange={e => setTransplantDate(e.target.value)}
                        style={{
                            padding: '13px 14px', fontSize: 15,
                            border: `1.5px solid ${seasonalWarning ? '#FFB74D' : T.border}`,
                            borderRadius: 12,
                            outline: 'none', background: T.surface, color: T.text,
                        }}
                    />

                    {/* Off-season warning */}
                    {seasonalWarning && (
                        <div style={{
                            background: '#FFF8E1',
                            border: '1px solid #FFB74D',
                            borderRadius: 12,
                            padding: '14px 16px',
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#E65100', marginBottom: 6 }}>
                                ⚠️ Off-Season Planting
                            </div>
                            <div style={{ fontSize: 12, color: '#BF360C', lineHeight: 1.6 }}>
                                {seasonalWarning.message}
                            </div>

                            {seasonalWarning.suggestion && (
                                <div style={{ marginTop: 10 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#E65100', marginBottom: 4 }}>
                                        Extend your season with a tunnel:
                                    </div>
                                    {seasonalWarning.suggestion.split('\n').map((line, i) => (
                                        <div key={i} style={{ fontSize: 12, color: '#BF360C', lineHeight: 1.7 }}>
                                            • {line}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: 10, fontSize: 11, color: '#795548', fontStyle: 'italic' }}>
                                Advisory only — you can still start the cycle.
                            </div>
                        </div>
                    )}
                </div>

                {/* Previous Crop (optional) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>
                        Previous Crop <span style={{ color: T.placeholder }}>(optional)</span>
                    </label>
                    <select
                        value={previousCrop}
                        onChange={e => setPreviousCrop(e.target.value)}
                        style={{
                            padding: '13px 14px', fontSize: 15,
                            border: `1.5px solid ${T.border}`, borderRadius: 12,
                            outline: 'none', background: T.surface, color: T.text,
                        }}
                    >
                        <option value="">None / First season</option>
                        <option value="WHEAT">Wheat</option>
                        <option value="MAIZE">Maize</option>
                        <option value="COTTON">Cotton</option>
                        <option value="LEGUME">Legume / Pulses</option>
                        <option value="FALLOW">Fallow (rested)</option>
                    </select>
                </div>

                {/* Start button */}
                <button
                    onClick={handleStart}
                    disabled={loading}
                    style={{
                        background: loading ? T.muted : T.green800,
                        color: 'white', border: 'none', borderRadius: 14,
                        padding: '14px 20px', fontSize: 16, fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer', width: '100%',
                    }}
                >
                    {loading ? 'Starting...' : 'Start Crop Cycle'}
                </button>

                <button
                    onClick={() => navigate('plots')}
                    style={{
                        background: 'transparent', color: T.muted,
                        border: 'none', fontSize: 14, cursor: 'pointer', padding: 4,
                    }}
                >
                    Cancel
                </button>

            </div>
        </div>
    );
}
