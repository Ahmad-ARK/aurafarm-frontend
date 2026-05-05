'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { T } from '@/lib/tokens';

const MapPicker = dynamic<{ onLocationSelect: (lat: number, lng: number) => void }>(
    () => import('@/components/ui/MapPicker'),
    { ssr: false }
);

const API = 'https://aurafarm-production-1691.up.railway.app';

// Nominatim returns full province names, our DB uses these keys
const PROVINCE_MAP: Record<string, string> = {
    'Punjab': 'Punjab',
    'Sindh': 'Sindh',
    'Balochistan': 'Balochistan',
    'Khyber Pakhtunkhwa': 'KPK',
    'KPK': 'KPK',
};

const PROVINCES = ['Punjab', 'Sindh', 'Balochistan', 'KPK'];

type Props = { navigate: (s: string) => void };

export default function AddPlotScreen({ navigate }: Props) {
    const [plotName, setPlotName] = useState('');
    const [area, setArea] = useState('');
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [farmingType, setFarmingType] = useState('OPEN_FIELD');
    const [irrigationSource, setIrrigation] = useState('CANAL');
    const [loading, setLoading] = useState(false);

    // Location detection state
    const [locationLabel, setLocationLabel] = useState('');   // "Lahore, Punjab"
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [locationFailed, setLocationFailed] = useState(false); // show manual inputs

    async function handleLocationSelect(newLat: number, newLng: number) {
        setLat(newLat);
        setLng(newLng);
        setLocationLabel('Detecting location...');
        setLocationFailed(false);

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();

            const rawProvince = data.address?.state || '';
            const rawDistrict = data.address?.county || data.address?.state_district || '';

            const detectedProvince = PROVINCE_MAP[rawProvince] || '';
            const detectedDistrict = rawDistrict.replace(/ District$/i, '').trim();

            if (detectedProvince) {
                setProvince(detectedProvince);
                setDistrict(detectedDistrict);
                setLocationLabel(`📍 ${detectedDistrict ? detectedDistrict + ', ' : ''}${detectedProvince}`);
            } else {
                setLocationLabel('');
                setLocationFailed(true);
            }
        } catch {
            setLocationLabel('');
            setLocationFailed(true);
        }
    }

    async function handleSubmit() {
        if (!lat || !lng) return alert('Please drop a pin on the map');
        if (!area) return alert('Please enter area');

        setLoading(true);
        const token = localStorage.getItem('token');
        const farmerId = localStorage.getItem('farmerId');

        const res = await fetch(`${API}/api/farm-plots`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                farmerId,
                plotName: plotName || undefined,
                latitude: lat,
                longitude: lng,
                areaAcres: parseFloat(area),
                farmingTypeId: farmingType,
                irrigationSourceId: irrigationSource,
                province: province || undefined,
                district: district || undefined,
            }),
        });

        setLoading(false);
        if (res.ok) {
            navigate('plots');
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to add plot');
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: 12,
        border: `1px solid ${T.border}`,
        fontSize: 14,
        background: T.surface,
        color: T.text,
        boxSizing: 'border-box' as const,
        outline: 'none',
    };

    const labelStyle = {
        fontSize: 13,
        fontWeight: 500,
        color: T.muted,
        marginBottom: 6,
        display: 'block' as const,
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Plot Name */}
                <div>
                    <label style={labelStyle}>Plot Name (optional)</label>
                    <input
                        style={inputStyle}
                        placeholder="e.g. North Field"
                        value={plotName}
                        onChange={e => setPlotName(e.target.value)}
                    />
                </div>

                {/* Area */}
                <div>
                    <label style={labelStyle}>Area (acres)</label>
                    <input
                        style={inputStyle}
                        type="number"
                        placeholder="e.g. 2.5"
                        value={area}
                        onChange={e => setArea(e.target.value)}
                    />
                </div>

                {/* Map */}
                <div>
                    <label style={labelStyle}>Plot Location — tap to drop pin</label>
                    <div style={{ borderRadius: 14, overflow: 'hidden', height: 200 }}>
                        <MapPicker onLocationSelect={handleLocationSelect} />
                    </div>

                    {/* Auto-detected location */}
                    {locationLabel && (
                        <div style={{ marginTop: 8, fontSize: 13, color: T.green800, fontWeight: 500 }}>
                            {locationLabel}
                        </div>
                    )}

                    {/* Manual inputs if auto-detect failed */}
                    {locationFailed && (
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ fontSize: 13, color: T.muted }}>
                                Could not detect location. Please select manually:
                            </div>
                            <select
                                style={inputStyle}
                                value={province}
                                onChange={e => setProvince(e.target.value)}
                            >
                                <option value="">Select Province</option>
                                {PROVINCES.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <input
                                style={inputStyle}
                                placeholder="District (optional)"
                                value={district}
                                onChange={e => setDistrict(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Farming Type */}
                <div>
                    <label style={labelStyle}>Farming Type</label>
                    <select style={inputStyle} value={farmingType} onChange={e => setFarmingType(e.target.value)}>
                        <option value="OPEN_FIELD">Open Field</option>
                        <option value="TUNNEL_SIMPLE">Low Tunnel</option>
                        <option value="TUNNEL_ADVANCED">High Tunnel</option>
                    </select>
                </div>

                {/* Irrigation Source */}
                <div>
                    <label style={labelStyle}>Water Source</label>
                    <select style={inputStyle} value={irrigationSource} onChange={e => setIrrigation(e.target.value)}>
                        <option value="CANAL">Canal</option>
                        <option value="TUBEWELL">Tubewell</option>
                        <option value="BRACKISH">Brackish</option>
                    </select>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        background: loading ? T.muted : T.green800,
                        color: 'white',
                        border: 'none',
                        borderRadius: 14,
                        padding: '16px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: 4,
                    }}
                >
                    {loading ? 'Adding...' : 'Add Plot'}
                </button>

            </div>
        </div>
    );
}