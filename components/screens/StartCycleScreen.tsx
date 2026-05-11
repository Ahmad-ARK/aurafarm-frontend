'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import Icon from '@/components/ui/Icon';
import { useTranslation } from "@/lib/useTranslation";

const API = 'https://aurafarm-production-1691.up.railway.app';

// Valid transplant months (1-indexed) per farming type — Pakistan tomato seasons
const SEASONAL_WINDOWS: Record<string, number[]> = {
    OPEN_FIELD: [2, 3, 7, 8],            // Feb–Mar (spring), Jul–Aug (autumn)
    TUNNEL_SIMPLE: [1, 2, 3, 4, 7, 8, 9],   // Jan–Apr, Jul–Sep
    TUNNEL_ADVANCED: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12], // almost year-round
};

function getSeasonalWarning(
    farmingTypeId: string,
    month: number,
    tFn: (k: string, v?: Record<string, string | number>) => string,
): { message: string; suggestion: string } | null {
    if (!farmingTypeId || !month) return null;
    const windows = SEASONAL_WINDOWS[farmingTypeId];
    if (!windows || windows.includes(month)) return null;

    const monthName = (m: number) => tFn(`month_short_${m}`);
    const validNames = windows.map(monthName).join(', ');
    const typeLabel = tFn(`type_${farmingTypeId === 'OPEN_FIELD' ? 'open' : farmingTypeId === 'TUNNEL_SIMPLE' ? 'simple' : 'advanced'}`);
    let suggestion = '';

    if (farmingTypeId === 'OPEN_FIELD') {
        suggestion =
            `${tFn('type_simple')}: ${SEASONAL_WINDOWS.TUNNEL_SIMPLE.filter(m => !windows.includes(m)).map(monthName).join(', ')}\n` +
            `${tFn('type_advanced')}: ${SEASONAL_WINDOWS.TUNNEL_ADVANCED.map(monthName).join(', ')}`;
    } else if (farmingTypeId === 'TUNNEL_SIMPLE') {
        suggestion = `${tFn('type_advanced')}: ${SEASONAL_WINDOWS.TUNNEL_ADVANCED.filter(m => !windows.includes(m)).map(monthName).join(', ')}`;
    }

    return {
        message: tFn('cycle_offseason_msg', { month: monthName(month), type: typeLabel, months: validNames }),
        suggestion,
    };
}

export default function StartCycleScreen({ navigate, plotId }: { navigate: (s: string) => void; plotId?: string }) {
    const { t } = useTranslation();
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
                // Pre-select the plot passed from PlotsScreen, otherwise default to first
                if (plotId && data.find((p: any) => p.id === plotId)) {
                    setSelectedPlot(plotId);
                } else if (data.length > 0) {
                    setSelectedPlot(data[0].id);
                }
            }
        }
        loadPlots();
    }, [plotId]);

    async function handleStart() {
        if (!selectedPlot || !transplantDate) {
            alert(t('cycle_please_select'));
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
            alert(data.error || t('cycle_failed'));
        }
    }

    // Derive farming type from selected plot
    const selectedPlotObj = plots.find(p => p.id === selectedPlot);
    const farmingTypeId: string = selectedPlotObj?.farmingType?.id || '';

    // Off-season check
    const transplantMonth = transplantDate ? new Date(transplantDate).getMonth() + 1 : 0;
    const seasonalWarning = transplantDate ? getSeasonalWarning(farmingTypeId, transplantMonth, t) : null;

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
                    {t('cycle_info')}
                </div>

                {/* Plot selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>{t('cycle_select_plot')}</label>
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
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Icon name="mapPin" size={12} color={T.muted} /> {farmingTypeId === 'OPEN_FIELD' ? t('type_open') : farmingTypeId === 'TUNNEL_SIMPLE' ? t('type_simple') : t('type_advanced')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Crop — fixed to Tomato for now */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>{t('cycle_crop')}</label>
                    <div style={{
                        padding: '13px 14px', fontSize: 15,
                        border: `1.5px solid ${T.border}`, borderRadius: 12,
                        background: '#F9F9F9', color: T.muted,
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="leaf" size={16} color={T.muted} /> {t('cycle_tomato')}
                        </span>
                    </div>
                </div>

                {/* NPK Tier */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>{t('cycle_level')}</label>
                    <select
                        value={npkTier}
                        onChange={e => setNpkTier(e.target.value)}
                        style={{
                            padding: '13px 14px', fontSize: 15,
                            border: `1.5px solid ${T.border}`, borderRadius: 12,
                            outline: 'none', background: T.surface, color: T.text,
                        }}
                    >
                        <option value="TOMATO_COMMERCIAL">{t('cycle_commercial')}</option>
                        <option value="TOMATO_EXTENSION">{t('cycle_extension')}</option>
                    </select>
                </div>

                {/* Transplant Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>{t('cycle_transplant_date')}</label>
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
                                {t('cycle_offseason_title')}
                            </div>
                            <div style={{ fontSize: 12, color: '#BF360C', lineHeight: 1.6 }}>
                                {seasonalWarning.message}
                            </div>

                            {seasonalWarning.suggestion && (
                                <div style={{ marginTop: 10 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#E65100', marginBottom: 4 }}>
                                        {t('cycle_extend')}
                                    </div>
                                    {seasonalWarning.suggestion.split('\n').map((line, i) => (
                                        <div key={i} style={{ fontSize: 12, color: '#BF360C', lineHeight: 1.7 }}>
                                            • {line}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: 10, fontSize: 11, color: '#795548', fontStyle: 'italic' }}>
                                {t('cycle_advisory')}
                            </div>
                        </div>
                    )}
                </div>

                {/* Previous Crop (optional) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>
                        {t('cycle_prev_crop')} <span style={{ color: T.placeholder }}>({t('common_optional')})</span>
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
                        <option value="">{t('cycle_none')}</option>
                        <option value="WHEAT">{t('cycle_wheat')}</option>
                        <option value="MAIZE">{t('cycle_maize')}</option>
                        <option value="COTTON">{t('cycle_cotton')}</option>
                        <option value="LEGUME">{t('cycle_legume')}</option>
                        <option value="FALLOW">{t('cycle_fallow')}</option>
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
                    {loading ? t('cycle_starting') : t('cycle_start')}
                </button>

                <button
                    onClick={() => navigate('plots')}
                    style={{
                        background: 'transparent', color: T.muted,
                        border: 'none', fontSize: 14, cursor: 'pointer', padding: 4,
                    }}
                >
                    {t('cycle_cancel')}
                </button>

            </div>
        </div>
    );
}
