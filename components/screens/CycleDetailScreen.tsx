'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';

const TOMATO_STAGES = [
    { number: 1, name: 'Establishment', days: '0–30' },
    { number: 2, name: 'Flowering', days: '31–60' },
    { number: 3, name: 'Fruit Bulking', days: '61–95' },
    { number: 4, name: 'Maturation', days: '96+' },
];

type Props = {
    cycleId: string;
    navigate: (s: string, data?: { cycleId?: string }) => void;
};

export default function CycleDetailScreen({ cycleId, navigate }: Props) {
    const token = localStorage.getItem('token') || '';

    const [cycle, setCycle] = useState<any>(null);
    const [currentStage, setCurrentStage] = useState<any>(null);
    const [daysActive, setDaysActive] = useState<number>(0);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                Loading cycle...
            </div>
        );
    }

    if (!cycle) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                Cycle not found.
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
                            {isPreTransplant ? 'Transplant In' : 'Days Since Transplant'}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>
                            {isPreTransplant ? `${Math.abs(daysActive)} days` : daysActive}
                        </div>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        flex: 1,
                    }}>
                        <div style={{ fontSize: 11, opacity: 0.7 }}>Transplant Date</div>
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
                        Growth Stages
                    </div>

                    {isPreTransplant ? (
                        <div style={{ textAlign: 'center', padding: '12px 0' }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Nursery Period</div>
                            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
                                Seedlings will be transplanted in {Math.abs(daysActive)} day{Math.abs(daysActive) !== 1 ? 's' : ''}
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
                                        <div style={{ fontSize: 11, color: T.muted }}>Day {stage.days}</div>
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
                                            Current
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
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#E65100' }}>⚠️ Disease Alerts</div>
                            <div style={{ fontSize: 12, color: '#BF360C', marginTop: 2 }}>
                                {alertCount} active alert{alertCount > 1 ? 's' : ''}
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
                            <div style={{ fontSize: 14, fontWeight: 600 }}>🌿 Fertilizer Plan</div>
                            <div style={{ fontSize: 12, marginTop: 2 }}>
                                Available after transplanting
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
                            <div style={{ fontSize: 14, fontWeight: 600 }}>🌿 Fertilizer Plan</div>
                            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                                {hasFertRec ? 'View recommendation' : 'Generate recommendation'}
                            </div>
                        </div>
                        <div style={{ fontSize: 20 }}>›</div>
                    </div>
                )}

                {/* Disease Scan button */}
                {!isPreTransplant && (
                    <div
                        onClick={() => navigate('disease-check')}
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
                            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>🔍 Scan Leaf for Disease</div>
                            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                                Upload a photo to detect disease with AI
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
                    <div style={{ fontSize: 12, color: T.muted }}>Fertilizer Program</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginTop: 4 }}>
                        {cycle.npkTier?.id === 'TOMATO_COMMERCIAL' ? 'Commercial Grower' : 'Extension / Small Farm'}
                    </div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                        {cycle.plot?.plotName} · {cycle.plot?.areaAcres} acres
                    </div>
                </div>

            </div>
        </div>
    );
}