'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import Icon from '@/components/ui/Icon';
import { useTranslation } from '@/lib/useTranslation';

const API = 'https://aurafarm-production-1691.up.railway.app';

type Props = {
    cycleId: string;
    navigate: (s: string, data?: { cycleId?: string }) => void;
};

export default function FertilizerScreen({ cycleId, navigate }: Props) {
    const { t } = useTranslation();
    const token = localStorage.getItem('token') || '';

    const [rec, setRec] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadCycle() {
            const res = await fetch(`${API}/api/crop-cycles/${cycleId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.fertRecs?.length > 0) {
                setRec(data.fertRecs[0]);
            }
            setLoading(false);
        }
        if (cycleId) loadCycle();
    }, [cycleId]);

    async function handleGenerate() {
        setGenerating(true);
        setError('');
        const res = await fetch(`${API}/api/crop-cycles/${cycleId}/fertilizer`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
            setRec(data);
        } else {
            setError(data.error || t('common_failed'));
        }
        setGenerating(false);
    }

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                {t('fert_loading')}
            </div>
        );
    }

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>

            <div style={{
                background: `linear-gradient(160deg, ${T.green900} 0%, ${T.green700} 100%)`,
                padding: '20px 20px 28px',
                color: 'white',
            }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{t('fert_plan')}</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                    {rec ? t('fert_based') : t('fert_for_stage')}
                </div>
            </div>

            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {!rec && (
                    <div style={{
                        background: T.surface, borderRadius: 16,
                        border: `1px solid ${T.border}`, padding: '28px 20px', textAlign: 'center',
                    }}>
                        <div style={{ marginBottom: 12 }}><Icon name="leaf" size={40} color={T.green700} /></div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 8 }}>
                            {t('fert_no_rec')}
                        </div>
                        <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
                            {t('fert_desc')}
                        </div>
                        {error && <div style={{ color: T.red500, fontSize: 13, marginBottom: 12 }}>{error}</div>}
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            style={{
                                background: generating ? T.muted : T.green800,
                                color: 'white', border: 'none', borderRadius: 12,
                                padding: '14px 28px', fontSize: 14, fontWeight: 600,
                                cursor: generating ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {generating ? t('fert_generating') : t('fert_generate')}
                        </button>
                    </div>
                )}

                {rec && (
                    <>
                        {/* NPK summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                            {[
                                { label: t('fert_n'), value: `${Number(rec.nAdjKg).toFixed(1)} kg` },
                                { label: t('fert_p'), value: `${Number(rec.pAdjKg).toFixed(1)} kg` },
                                { label: t('fert_k'), value: `${Number(rec.kAdjKg).toFixed(1)} kg` },
                            ].map(item => (
                                <div key={item.label} style={{
                                    background: T.green50, borderRadius: 12,
                                    padding: '12px 10px', textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: T.green800 }}>{item.value}</div>
                                    <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{item.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Fertilizer bags */}
                        <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{t('fert_bags_title')}</div>
                            </div>
                            {rec.items?.map((item: any, i: number) => (
                                <div key={i} style={{ padding: '14px 16px', borderBottom: i < rec.items.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{item.fertilizerId}</div>
                                            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{item.applicationTiming}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: T.green800 }}>{item.bagsRequired}</div>
                                            <div style={{ fontSize: 11, color: T.muted }}>{t('common_bags')}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 8 }}>
                                        <span style={{ background: T.green50, color: T.green800, fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6 }}>
                                            {item.kgTotal} {t('fert_kg_total')} · {item.purpose}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Soil values */}
                        <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: '14px 16px' }}>
                            <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>{t('fert_soil_title')}</div>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: T.muted }}>{t('fert_soil_ph')}</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{Number(rec.soilPhUsed).toFixed(1)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: T.muted }}>{t('fert_soil_ec')}</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{Number(rec.soilEcUsed).toFixed(2)} dS/m</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: T.muted }}>{t('fert_effective_ec')}</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{Number(rec.effectiveEcUsed).toFixed(2)} dS/m</div>
                                </div>
                            </div>
                        </div>

                        {/* Regenerate */}
                        <div style={{ textAlign: 'center', paddingBottom: 8 }}>
                            {error && <div style={{ color: T.red500, fontSize: 13, marginBottom: 10 }}>{error}</div>}
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                style={{
                                    background: 'transparent',
                                    color: generating ? T.muted : T.green800,
                                    border: `1.5px solid ${generating ? T.border : T.green800}`,
                                    borderRadius: 12, padding: '11px 24px', fontSize: 13, fontWeight: 600,
                                    cursor: generating ? 'not-allowed' : 'pointer', width: '100%',
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <Icon name="refresh" size={14} color={generating ? T.muted : T.green800} />
                                    {generating ? t('fert_regenerating') : t('fert_regen')}
                                </span>
                            </button>
                            <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>{t('fert_regen_hint')}</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
