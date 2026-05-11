'use client';

import { useState, useRef, useEffect } from 'react';
import { T } from '@/lib/tokens';
import Icon from '@/components/ui/Icon';
import { useTranslation } from '@/lib/useTranslation';

type DiseaseEntry = { urdu: string; pathogen: string; cure: boolean; action: string };

const DISEASE_INFO: Record<string, DiseaseEntry> = {
    'Bacterial spot': {
        urdu: 'بیکٹیریائی دھبے',
        pathogen: 'Bacterial',
        cure: true,
        action: 'کاپر پر مبنی دوائی (Kocide یا Funguran OH) لگائیں۔ اوپر سے پانی دینا بند کریں۔ متاثرہ پتے ہٹا دیں۔ اگلی فصل میں کراپ روٹیشن کریں۔',
    },
    'Early blight': {
        urdu: 'اگیتا جھلساؤ',
        pathogen: 'Fungal',
        cure: true,
        action: 'مینکوزیب (Dithane M-45) یا Daconil ہر ۷ تا ۱۰ دن میں لگائیں۔ نیچے کے متاثرہ پتے ہٹا دیں۔ پودوں کے درمیان ہوا کا گزر یقینی بنائیں۔',
    },
    'Late blight': {
        urdu: 'پچھیتا جھلساؤ',
        pathogen: 'Fungal',
        cure: false,
        action: 'فوری طور پر Ridomil Gold یا Funguran لگائیں۔ تمام متاثرہ حصے نکال کر جلا دیں۔ پتوں کو گیلا نہ ہونے دیں۔ یہ بیماری بہت تیزی سے پھیلتی ہے — فوری اقدام کریں۔',
    },
    'Leaf mold': {
        urdu: 'پتے کی پھپھوندی',
        pathogen: 'Fungal',
        cure: true,
        action: 'ہوا کی آمدورفت بہتر بنائیں اور نمی ۸۵٪ سے کم رکھیں۔ Dithane M-45 یا Blue Shield لگائیں۔ متاثرہ پتے توڑ کر تلف کریں۔',
    },
    'Septoria leaf spot': {
        urdu: 'سیپٹوریا دھبے',
        pathogen: 'Fungal',
        cure: true,
        action: 'Dithane M-45 لگائیں۔ نیچے کے متاثرہ پتے فوری ہٹائیں۔ پودوں کی جڑوں پر مٹی چڑھائیں تاکہ چھینٹے نہ پڑیں۔ گیلے پودوں میں کام نہ کریں۔',
    },
    'Spider mites': {
        urdu: 'سُرخ مکڑی',
        pathogen: 'Pest',
        cure: true,
        action: 'Vertimec یا نیم آئل کا محلول پتوں کے نیچے اچھی طرح لگائیں۔ پودوں کے قریب نمی بڑھائیں۔ بہت زیادہ متاثرہ پتے ہٹا دیں۔ ہر ہفتے دہرائیں۔',
    },
    'Target spot': {
        urdu: 'ہدف دھبہ',
        pathogen: 'Fungal',
        cure: true,
        action: 'Amistar (ازوکسی سٹروبن) یا Dithane M-45 لگائیں۔ متاثرہ پتے ہٹائیں۔ ہوا کا گزر یقینی بنائیں۔ اوپر سے پانی دینا بند کریں۔',
    },
    'Mosaic virus': {
        urdu: 'موزیک وائرس',
        pathogen: 'Viral',
        cure: false,
        action: 'متاثرہ پودے فوری نکال کر جلا دیں۔ وائرس پھیلانے والے ایفڈز کے لیے Confidor لگائیں۔ اوزار صاف اور جراثیم سے پاک کریں۔ اگلی فصل میں مزاحم قسم لگائیں۔',
    },
    'Yellow leaf curl virus': {
        urdu: 'پیلا پتہ موڑ وائرس',
        pathogen: 'Viral',
        cure: false,
        action: 'متاثرہ پودے فوری نکال کر جلا دیں۔ سفید مکھی کے لیے Confidor یا Admire لگائیں۔ پیلے چپکنے والے کارڈ لگائیں۔ اگلی فصل میں مزاحم قسم استعمال کریں۔',
    },
    'Healthy': {
        urdu: 'صحت مند',
        pathogen: '',
        cure: true,
        action: 'کوئی علاج ضروری نہیں۔ پودا صحت مند نظر آ رہا ہے۔ باقاعدہ نگرانی جاری رکھیں۔',
    },
};

// Case-insensitive lookup to handle any variation the model returns
function getDiseaseInfo(prediction: string): DiseaseEntry | null {
    if (DISEASE_INFO[prediction]) return DISEASE_INFO[prediction];
    const lower = prediction.toLowerCase();
    const key = Object.keys(DISEASE_INFO).find(k => k.toLowerCase() === lower);
    return key ? DISEASE_INFO[key] : null;
}

type LeafScan = {
    id: string;
    prediction: string;
    confidence: number;
    scannedAt: string;
};

type Props = {
    cycleId?: string;
    navigate: (s: string) => void;
};

export default function DiseaseCheckScreen({ cycleId, navigate }: Props) {
    const { t } = useTranslation();
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [result, setResult] = useState<{ prediction: string; confidence: number } | null>(null);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState<LeafScan[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!cycleId) return;
        setLoadingHistory(true);
        const token = localStorage.getItem('token') || '';
        fetch(`https://aurafarm-production-1691.up.railway.app/api/disease/scans/${cycleId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setHistory(data); })
            .catch(() => {})
            .finally(() => setLoadingHistory(false));
    }, [cycleId]);

    function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setResult(null);
        setError('');
        const reader = new FileReader();
        reader.onload = (ev) => setImage(ev.target?.result as string);
        reader.readAsDataURL(file);
    }

    async function handleScan() {
        if (!imageFile) return;
        setScanning(true);
        setError('');

        const formData = new FormData();
        formData.append('file', imageFile);
        if (cycleId) formData.append('cycleId', cycleId);

        try {
            const token = localStorage.getItem('token') || '';
            const res = await fetch('https://aurafarm-production-1691.up.railway.app/api/disease/predict', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            setResult(data);

            // Add to local history immediately
            if (cycleId) {
                const newScan: LeafScan = {
                    id: Date.now().toString(),
                    prediction: data.prediction,
                    confidence: data.confidence,
                    scannedAt: new Date().toISOString(),
                };
                setHistory(prev => [newScan, ...prev]);
            }
        } catch {
            setError(t('disease_error'));
        }
        setScanning(false);
    }

    function handleReset() {
        setImage(null);
        setImageFile(null);
        setResult(null);
        setError('');
        setTimeout(() => inputRef.current?.click(), 100);
    }

    const diseaseInfo = result ? getDiseaseInfo(result.prediction) : null;
    const isLowConfidence = result && result.confidence < 70;
    const isHealthy = result?.prediction === 'Healthy';

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* Header */}
            <div style={{
                background: `linear-gradient(160deg, ${T.green900} 0%, ${T.green700} 100%)`,
                padding: '20px 20px 28px',
                color: 'white',
            }}>
                <div style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="search" size={20} color="white" /> {t('disease_title')}
                </div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                    {cycleId ? t('disease_saved_cycle') : t('disease_general')}
                </div>
            </div>

            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Upload area */}
                <div
                    onClick={() => !result && inputRef.current?.click()}
                    style={{
                        border: `2px dashed ${image ? 'transparent' : T.border}`,
                        borderRadius: 16,
                        padding: image ? 0 : '40px 20px',
                        textAlign: 'center',
                        cursor: result ? 'default' : 'pointer',
                        overflow: 'hidden',
                        background: T.surface,
                    }}
                >
                    {image ? (
                        <img
                            src={image}
                            alt="leaf"
                            style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 16 }}
                        />
                    ) : (
                        <>
                            <div style={{ marginBottom: 12 }}><Icon name="camera" size={40} color={T.muted} /></div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                                {t('disease_tap')}
                            </div>
                            <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>
                                {t('disease_clear')}
                            </div>
                        </>
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                />

                {/* Scan button */}
                {image && !result && (
                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        style={{
                            background: scanning ? T.muted : T.green800,
                            color: 'white',
                            border: 'none',
                            borderRadius: 14,
                            padding: '14px 20px',
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: scanning ? 'not-allowed' : 'pointer',
                            width: '100%',
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Icon name={scanning ? 'refresh' : 'search'} size={16} color="white" />
                            {scanning ? t('disease_analyzing') : t('disease_scan')}
                        </span>
                    </button>
                )}

                {error && (
                    <div style={{
                        background: '#FFEBEE',
                        border: '1px solid #FFCDD2',
                        borderRadius: 10,
                        padding: '10px 14px',
                        fontSize: 13,
                        color: '#C62828',
                    }}>
                        {error}
                    </div>
                )}

                {/* Low confidence warning */}
                {isLowConfidence && (
                    <div style={{
                        background: '#FFF8E1',
                        border: '1px solid #FFD54F',
                        borderRadius: 12,
                        padding: '12px 14px',
                        fontSize: 13,
                        color: '#F57F17',
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="alert" size={14} color="#F57F17" />
                            {t('disease_low_conf', { pct: result!.confidence.toFixed(1) })}
                        </span>
                    </div>
                )}

                {/* Result card */}
                {result && (
                    <>
                        <div style={{
                            background: isHealthy ? T.green50 : '#FFF3E0',
                            border: `1.5px solid ${isHealthy ? T.green100 : '#FFB74D'}`,
                            borderRadius: 16,
                            padding: '16px',
                        }}>
                            {/* Disease name + confidence */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>{t('disease_detected')}</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: isHealthy ? T.green800 : '#BF360C' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Icon name={isHealthy ? 'check' : 'bug'} size={18} color={isHealthy ? T.green800 : '#BF360C'} />
                                            {result.prediction}
                                        </span>
                                    </div>
                                    {diseaseInfo?.urdu && (
                                        <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>
                                            {diseaseInfo.urdu}
                                        </div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: isHealthy ? T.green800 : '#BF360C',
                                    }}>
                                        {result.confidence.toFixed(1)}%
                                    </div>
                                    <div style={{ fontSize: 11, color: T.muted }}>{t('disease_confidence')}</div>
                                </div>
                            </div>

                            {/* Tags */}
                            {diseaseInfo && diseaseInfo.pathogen && (
                                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                    <span style={{
                                        background: 'white',
                                        border: `1px solid ${T.border}`,
                                        borderRadius: 6,
                                        fontSize: 11,
                                        padding: '3px 8px',
                                        color: T.muted,
                                    }}>
                                        {t(`pathogen_${diseaseInfo.pathogen.toLowerCase()}` as any) || diseaseInfo.pathogen}
                                    </span>
                                    <span style={{
                                        background: diseaseInfo.cure ? T.green50 : '#FBE9E7',
                                        border: `1px solid ${diseaseInfo.cure ? T.green100 : '#FFAB91'}`,
                                        borderRadius: 6,
                                        fontSize: 11,
                                        padding: '3px 8px',
                                        color: diseaseInfo.cure ? T.green800 : '#BF360C',
                                    }}>
                                        {diseaseInfo.cure ? t('disease_treatable') : t('disease_no_cure')}
                                    </span>
                                </div>
                            )}

                            {/* Action */}
                            {diseaseInfo && (
                                <div style={{
                                    background: 'white',
                                    borderRadius: 10,
                                    padding: '10px 12px',
                                    fontSize: 13,
                                    color: T.text,
                                    lineHeight: 1.6,
                                }}>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('disease_action')}</div>
                                    <div>{diseaseInfo.action}</div>
                                </div>
                            )}

                            {cycleId && (
                                <div style={{ marginTop: 10, fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Icon name="check" size={11} color={T.muted} /> {t('disease_saved')}
                                </div>
                            )}
                        </div>

                        {/* Scan again */}
                        <button
                            onClick={handleReset}
                            style={{
                                background: 'transparent',
                                color: T.green800,
                                border: `1.5px solid ${T.green800}`,
                                borderRadius: 12,
                                padding: '11px 20px',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                width: '100%',
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Icon name="camera" size={15} color={T.green800} /> {t('disease_scan_another')}
                            </span>
                        </button>
                    </>
                )}

                {/* Scan History */}
                {cycleId && (
                    <div style={{
                        background: T.surface,
                        borderRadius: 16,
                        border: `1px solid ${T.border}`,
                        padding: '14px 16px',
                    }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 12 }}>
                            {t('disease_history')}
                        </div>

                        {loadingHistory && (
                            <div style={{ fontSize: 13, color: T.muted, textAlign: 'center', padding: '8px 0' }}>
                                {t('disease_loading_history')}
                            </div>
                        )}

                        {!loadingHistory && history.length === 0 && (
                            <div style={{ fontSize: 13, color: T.muted, textAlign: 'center', padding: '8px 0' }}>
                                {t('disease_no_scans')}
                            </div>
                        )}

                        {history.map((scan, i) => {
                            const healthy = scan.prediction === 'Healthy';
                            return (
                                <div
                                    key={scan.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: i > 0 ? 10 : 0,
                                        marginTop: i > 0 ? 10 : 0,
                                        borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                                    }}
                                >
                                    <div>
                                        <div style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: healthy ? T.green800 : '#BF360C',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 5,
                                        }}>
                                            <Icon name={healthy ? 'check' : 'bug'} size={12} color={healthy ? T.green800 : '#BF360C'} />
                                            {scan.prediction}
                                        </div>
                                        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                                            {new Date(scan.scannedAt).toLocaleDateString('en-GB', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: healthy ? T.green800 : '#BF360C',
                                    }}>
                                        {Number(scan.confidence).toFixed(1)}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}
