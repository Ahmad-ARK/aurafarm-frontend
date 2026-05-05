'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';

export default function StartCycleScreen({ navigate }: { navigate: (s: string) => void }) {
    const [plots, setPlots] = useState<any[]>([]);
    const [selectedPlot, setSelectedPlot] = useState('');
    const [npkTier, setNpkTier] = useState('TOMATO_COMMERCIAL');
    const [transplantDate, setTransplantDate] = useState('');
    const [previousCrop, setPreviousCrop] = useState('');
    const [loading, setLoading] = useState(false);

    // Load farmer's plots on mount
    useEffect(() => {
        async function loadPlots() {
            const token = localStorage.getItem('token');
            const farmerId = localStorage.getItem('farmerId');

            const res = await fetch(
                `https://aurafarm-production-1691.up.railway.app/api/farm-plots/farmer/${farmerId}`,
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

        const res = await fetch('https://aurafarm-production-1691.up.railway.app/api/crop-cycles', {
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>Transplant Date</label>
                    <input
                        type="date"
                        value={transplantDate}
                        onChange={e => setTransplantDate(e.target.value)}
                        style={{
                            padding: '13px 14px', fontSize: 15,
                            border: `1.5px solid ${T.border}`, borderRadius: 12,
                            outline: 'none', background: T.surface, color: T.text,
                        }}
                    />
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