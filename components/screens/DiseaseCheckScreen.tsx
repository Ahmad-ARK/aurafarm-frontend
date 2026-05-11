'use client';

import { useState, useRef, useEffect } from 'react';
import { T } from '@/lib/tokens';
import Icon from '@/components/ui/Icon';

const DISEASE_INFO: Record<string, { urdu: string; pathogen: string; cure: boolean; action: string }> = {
    'Late Blight': { urdu: 'بدیا جھلساؤ', pathogen: 'Fungal', cure: false, action: 'Apply copper-based fungicide immediately. Remove and destroy infected leaves.' },
    'Early Blight': { urdu: 'اگیتا جھلساؤ', pathogen: 'Fungal', cure: true, action: 'Apply mancozeb or chlorothalonil fungicide. Improve air circulation around plants.' },
    'Tomato Yellow Leaf Curl': { urdu: 'پیلا پتہ موڑ', pathogen: 'Viral', cure: false, action: 'Remove infected plants immediately. Control whitefly population with insecticide.' },
    'Bacterial Wilt': { urdu: 'بیکٹیریائی مرجھاؤ', pathogen: 'Bacterial', cure: false, action: 'Remove infected plants. Avoid overhead irrigation. Practice crop rotation.' },
    'Powdery Mildew': { urdu: 'سفید چورن', pathogen: 'Fungal', cure: true, action: 'Apply sulfur-based fungicide. Reduce humidity and improve ventilation.' },
    'Blossom End Rot': { urdu: 'پھول سڑن', pathogen: 'Physiological', cure: true, action: 'Ensure consistent watering. Apply calcium spray. Check soil pH.' },
    'Healthy': { urdu: 'صحت مند', pathogen: '', cure: true, action: 'No action needed. Plant appears healthy.' },
};

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
            setError('Failed to analyze image. Check your connection and try again.');
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

    const diseaseInfo = result ? DISEASE_INFO[result.prediction] : null;
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
                    <Icon name="search" size={20} color="white" /> Leaf Disease Scan
                </div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                    {cycleId
                        ? 'Scans are saved to your active crop cycle'
                        : 'Take a clear photo of a tomato leaf to detect disease'}
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
                                Tap to take or upload photo
                            </div>
                            <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>
                                Use a clear, well-lit photo of a single leaf
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
                            {scanning ? 'Analyzing leaf...' : 'Scan for Disease'}
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
                            Low confidence ({result!.confidence.toFixed(1)}%) — please use a clearer, well-lit photo of the affected leaf.
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
                                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Detected Disease</div>
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
                                    <div style={{ fontSize: 11, color: T.muted }}>confidence</div>
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
                                        {diseaseInfo.pathogen}
                                    </span>
                                    <span style={{
                                        background: diseaseInfo.cure ? T.green50 : '#FBE9E7',
                                        border: `1px solid ${diseaseInfo.cure ? T.green100 : '#FFAB91'}`,
                                        borderRadius: 6,
                                        fontSize: 11,
                                        padding: '3px 8px',
                                        color: diseaseInfo.cure ? T.green800 : '#BF360C',
                                    }}>
                                        {diseaseInfo.cure ? 'Treatable' : 'No cure'}
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
                                    <span style={{ fontWeight: 600 }}>Recommended Action: </span>
                                    {diseaseInfo.action}
                                </div>
                            )}

                            {cycleId && (
                                <div style={{ marginTop: 10, fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Icon name="check" size={11} color={T.muted} /> Saved to cycle history
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
                                <Icon name="camera" size={15} color={T.green800} /> Scan Another Leaf
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
                            Scan History
                        </div>

                        {loadingHistory && (
                            <div style={{ fontSize: 13, color: T.muted, textAlign: 'center', padding: '8px 0' }}>
                                Loading history...
                            </div>
                        )}

                        {!loadingHistory && history.length === 0 && (
                            <div style={{ fontSize: 13, color: T.muted, textAlign: 'center', padding: '8px 0' }}>
                                No scans yet for this cycle
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
                                            {new Date(scan.scannedAt).toLocaleDateString('en-PK', {
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
