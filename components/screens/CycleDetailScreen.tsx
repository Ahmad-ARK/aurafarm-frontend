'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import Icon from '@/components/ui/Icon';
import { useTranslation } from '@/lib/useTranslation';

type Props = {
    cycleId: string;
    navigate: (s: string, data?: { cycleId?: string; plotId?: string; plotName?: string }) => void;
};

export default function CycleDetailScreen({ cycleId, navigate }: Props) {
    const { t } = useTranslation();
    const TOMATO_STAGES = [
        { number: 1, name: t('detail_stage1'), days: '0–30' },
        { number: 2, name: t('detail_stage2'), days: '31–60' },
        { number: 3, name: t('detail_stage3'), days: '61–95' },
        { number: 4, name: t('detail_stage4'), days: '96+' },
    ];
    const token = localStorage.getItem('token') || '';

    const [cycle, setCycle] = useState<any>(null);
    const [currentStage, setCurrentStage] = useState<any>(null);
    const [daysActive, setDaysActive] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        async function loadData() {
            const res = await fetch(
                `https://aurafarm-production-1691.up.railway.app/api/crop-cycles/${cycleId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (res.ok) setCycle(data);

            const stageRes = await fetch(
                `https://aurafarm-production-1691.up.railway.app/api/crop-cycles/${cycleId}/stage`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const stageData = await stageRes.json();
            if (stageRes.ok) {
                setCurrentStage(stageData.stage);
                setDaysActive(stageData.daysSinceTransplant);
            }

            setLoading(false);
        }

        if (cycleId) loadData();
    }, [cycleId]);

    async function handleComplete() {
        const confirmed = window.confirm(t('detail_complete_confirm'));
        if (!confirmed) return;

        setCompleting(true);
        const res = await fetch(
            `https://aurafarm-production-1691.up.railway.app/api/crop-cycles/${cycleId}/complete`,
            { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
        );
        setCompleting(false);

        if (res.ok) {
            navigate('plots');
        } else {
            const data = await res.json();
            alert(data.error || t('detail_complete_failed'));
        }
    }

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                {t('detail_loading')}
            </div>
        );
    }

    if (!cycle) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                {t('detail_not_found')}
            </div>
        );
    }

    const transplantDate = new Date(cycle.transplantDate).toLocaleDateString('en-PK', {
        day: 'numeric', month: 'short', year: 'numeric',
    });

    const isPreTransplant = daysActive < 0;
    const alertCount = cycle.diseaseAlerts?.length || 0;
    const hasFertRec = cycle.fertRecs?.length > 0;

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* Green hero */}
            <div style={{
                background: `linear-gradient(160deg, ${T.green900} 0%, ${T.green700} 100%)`,
                padding: '20px 20px 28px',
                color: 'white',
            }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{cycle.crop?.name || 'Tomato'}</div>
                <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>{cycle.plot?.plotName}</div>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        flex: 1,
                    }}>
                        <div style={{ fontSize: 11, opacity: 0.7 }}>
                            {isPreTransplant ? t('detail_transplant_in') : t('detail_days_since')}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>
                            {isPreTransplant ? `${Math.abs(daysActive)} ${t('common_days')}` : daysActive}
                        </div>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        flex: 1,
                    }}>
                        <div style={{ fontSize: 11, opacity: 0.7 }}>{t('detail_transplant_date')}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{transplantDate}</div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Stage Timeline */}
                <div style={{
                    background: T.surface,
                    borderRadius: 16,
                    border: `1px solid ${T.border}`,
                    padding: '16px',
                }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 14 }}>
                        {t('detail_growth_stages')}
                    </div>

                    {isPreTransplant ? (
                        <div style={{ textAlign: 'center', padding: '12px 0' }}>
                            <div style={{ marginBottom: 8 }}><Icon name="leaf" size={32} color={T.green700} /></div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{t('detail_nursery')}</div>
                            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
                                {t('detail_nursery_sub', { days: Math.abs(daysActive) })}
                            </div>
                        </div>
                    ) : (
                        TOMATO_STAGES.map((stage, i) => {
                            const isActive = currentStage?.stageNumber === stage.number;
                            const isPast = currentStage ? stage.number < currentStage.stageNumber : false;

                            return (
                                <div
                                    key={stage.number}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        marginBottom: i < TOMATO_STAGES.length - 1 ? 10 : 0,
                                    }}
                                >
                                    <div style={{
                                        width: 12, height: 12,
                                        borderRadius: '50%',
                                        background: isActive ? T.green800 : isPast ? T.green400 : T.border,
                                        flexShrink: 0,
                                        outline: isActive ? `3px solid ${T.green100}` : 'none',
                                    }} />

                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: 13,
                                            fontWeight: isActive ? 600 : 400,
                                            color: isActive ? T.green900 : isPast ? T.text : T.muted,
                                        }}>
                                            {stage.name}
                                        </div>
                                        <div style={{ fontSize: 11, color: T.muted }}>{t('common_day')} {stage.days}</div>
                                    </div>

                                    {isActive && (
                                        <div style={{
                                            background: T.green50,
                                            color: T.green800,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            padding: '3px 8px',
                                            borderRadius: 6,
                                        }}>
                                            {t('detail_current')}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Disease Alerts warning */}
                {alertCount > 0 && (
                    <div
                        onClick={() => navigate('alerts', { cycleId })}
                        style={{
                            background: '#FFF3E0',
                            border: '1px solid #FFB74D',
                            borderRadius: 14,
                            padding: '14px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#E65100', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="alert" size={15} color="#E65100" /> {t('detail_disease_alerts')}
                            </div>
                            <div style={{ fontSize: 12, color: '#BF360C', marginTop: 2 }}>
                                {t('detail_active_alerts', { count: alertCount })}
                            </div>
                        </div>
                        <div style={{ fontSize: 20, color: '#E65100' }}>›</div>
                    </div>
                )}

                {/* Fertilizer Plan button */}
                {isPreTransplant ? (
                    <div style={{
                        background: '#F5F5F5',
                        borderRadius: 14,
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: T.muted,
                    }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="leaf" size={15} color={T.muted} /> {t('detail_fert_plan')}
                            </div>
                            <div style={{ fontSize: 12, marginTop: 2 }}>
                                {t('detail_fert_after')}
                            </div>
                        </div>
                        <div style={{ fontSize: 20 }}>›</div>
                    </div>
                ) : (
                    <div
                        onClick={() => navigate('fertilizer', { cycleId })}
                        style={{
                            background: T.green800,
                            borderRadius: 14,
                            padding: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            color: 'white',
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="leaf" size={15} color="white" /> {t('detail_fert_plan')}
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                                {hasFertRec ? t('detail_fert_view') : t('detail_fert_gen')}
                            </div>
                        </div>
                        <div style={{ fontSize: 20 }}>›</div>
                    </div>
                )}

                {/* Disease Scan button */}
                {!isPreTransplant && (
                    <div
                        onClick={() => navigate('disease-check', { cycleId })}
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
                                <Icon name="search" size={15} color={T.text} /> {t('detail_scan')}
                            </div>
                            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                                {t('detail_scan_sub')}
                            </div>
                        </div>
                        <div style={{ fontSize: 20, color: T.muted }}>›</div>
                    </div>
                )}


                {/* Cycle info card */}
                <div style={{
                    background: T.surface,
                    borderRadius: 14,
                    border: `1px solid ${T.border}`,
                    padding: '14px 16px',
                }}>
                    <div style={{ fontSize: 12, color: T.muted }}>{t('detail_fert_program')}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginTop: 4 }}>
                        {cycle.npkTier?.id === 'TOMATO_COMMERCIAL' ? t('detail_commercial') : t('detail_extension')}
                    </div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                        {cycle.plot?.plotName} · {cycle.plot?.areaAcres} {t('common_acres')}
                    </div>
                </div>

                {/* End Cycle button */}
                <button
                    onClick={handleComplete}
                    disabled={completing}
                    style={{
                        background: 'transparent',
                        color: completing ? T.muted : T.red500,
                        border: `1.5px solid ${completing ? T.border : T.red500}`,
                        borderRadius: 14,
                        padding: '14px 20px',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: completing ? 'not-allowed' : 'pointer',
                        width: '100%',
                        marginTop: 4,
                    }}
                >
                    {completing ? t('detail_completing') : t('detail_harvest')}
                </button>

                {/* Dev helper — tap to copy cycle ID */}
                <div
                    onClick={() => {
                        navigator.clipboard.writeText(cycleId);
                        alert('Cycle ID copied:\n' + cycleId);
                    }}
                    style={{
                        textAlign: 'center', cursor: 'pointer',
                        fontSize: 10, color: T.placeholder,
                        paddingBottom: 8, userSelect: 'all',
                    }}
                >
                    ID: {cycleId}
                </div>

            </div>
        </div>
    );
}