'use client';

import { useState, useRef } from 'react';
import { T } from '@/lib/tokens';

const ML_API = 'https://m-hussnain4646--tomato-disease-api-fastapi-app.modal.run';

const DISEASE_INFO: Record<string, { urdu: string; pathogen: string; cure: boolean; action: string }> = {
    'Late Blight': { urdu: 'بدیا جھلساؤ', pathogen: 'Fungal', cure: false, action: 'Apply copper-based fungicide immediately. Remove and destroy infected leaves.' },
    'Early Blight': { urdu: 'اگیتا جھلساؤ', pathogen: 'Fungal', cure: true, action: 'Apply mancozeb or chlorothalonil fungicide. Improve air circulation around plants.' },
    'Tomato Yellow Leaf Curl': { urdu: 'پیلا پتہ موڑ', pathogen: 'Viral', cure: false, action: 'Remove infected plants immediately. Control whitefly population with insecticide.' },
    'Bacterial Wilt': { urdu: 'بیکٹیریائی مرجھاؤ', pathogen: 'Bacterial', cure: false, action: 'Remove infected plants. Avoid overhead irrigation. Practice crop rotation.' },
    'Powdery Mildew': { urdu: 'سفید چورن', pathogen: 'Fungal', cure: true, action: 'Apply sulfur-based fungicide. Reduce humidity and improve ventilation.' },
    'Blossom End Rot': { urdu: 'پھول سڑن', pathogen: 'Physiological', cure: true, action: 'Ensure consistent watering. Apply calcium spray. Check soil pH.' },
    'Healthy': { urdu: 'صحت مند', pathogen: '', cure: true, action: 'No action needed. Plant appears healthy.' },
};

type Props = {
    navigate: (s: string) => void;
};

export default function DiseaseCheckScreen({ navigate }: Props) {
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [result, setResult] = useState<{ prediction: string; confidence: number } | null>(null);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

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
                <div style={{ fontSize: 20, fontWeight: 700 }}>🔍 Leaf Disease Scan</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                    Take a clear photo of a tomato leaf to detect disease
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
                            <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
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
                        {scanning ? '🔄 Analyzing leaf...' : '🔍 Scan for Disease'}
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
                        ⚠️ Low confidence ({result!.confidence.toFixed(1)}%) — please use a clearer, well-lit photo of the affected leaf.
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
                                        {isHealthy ? '✅' : '🦠'} {result.prediction}
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
                                        {diseaseInfo.cure ? '✓ Treatable' : '✗ No cure'}
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
                            📷 Scan Another Leaf
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}