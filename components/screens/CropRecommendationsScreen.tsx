'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const PROVINCES = [
    { id: 'PUNJAB', name: 'Punjab' },
    { id: 'SINDH', name: 'Sindh' },
    { id: 'KPK', name: 'KPK (Khyber Pakhtunkhwa)' },
    { id: 'BALOCHISTAN', name: 'Balochistan' },
];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
    'Vegetable': { bg: '#E8F5E9', color: '#2E7D32' },
    'Grain': { bg: '#FFF8E1', color: '#F57F17' },
    'Cash Crop': { bg: '#E3F2FD', color: '#1565C0' },
};

// province -> valid planting months (1-indexed)
const CROP_DATA = [
    {
        id: 'TOMATO', name: 'Tomato', urdu: 'ٹماٹر', emoji: '🍅',
        category: 'Vegetable', duration: '90–120 days', yieldPerAcre: '8–15 tons',
        provinces: { PUNJAB: [2, 3, 7, 8], SINDH: [10, 11, 1, 2], KPK: [3, 4], BALOCHISTAN: [2, 3] },
        note: 'High value crop. Requires disease monitoring and regular irrigation.',
    },
    {
        id: 'WHEAT', name: 'Wheat', urdu: 'گندم', emoji: '🌾',
        category: 'Grain', duration: '120–150 days', yieldPerAcre: '40–55 maunds',
        provinces: { PUNJAB: [10, 11], SINDH: [10, 11], KPK: [10, 11], BALOCHISTAN: [10, 11] },
        note: 'Main Rabi crop. Sow after cotton or rice harvest.',
    },
    {
        id: 'MAIZE', name: 'Maize', urdu: 'مکئی', emoji: '🌽',
        category: 'Grain', duration: '90–110 days', yieldPerAcre: '35–50 maunds',
        provinces: { PUNJAB: [2, 3, 6, 7], SINDH: [], KPK: [4, 5], BALOCHISTAN: [3, 4] },
        note: 'Spring and Kharif seasons. Grows well in Punjab and KPK. Needs 500–700mm water.',
    },
    {
        id: 'COTTON', name: 'Cotton', urdu: 'کپاس', emoji: '🪴',
        category: 'Cash Crop', duration: '150–180 days', yieldPerAcre: '25–40 maunds',
        provinces: { PUNJAB: [4, 5], SINDH: [4, 5], KPK: [], BALOCHISTAN: [] },
        note: 'Major cash crop of Punjab and Sindh. Requires hot dry climate.',
    },
    {
        id: 'WATERMELON', name: 'Watermelon', urdu: 'تربوز', emoji: '🍉',
        category: 'Vegetable', duration: '80–100 days', yieldPerAcre: '8–15 tons',
        provinces: { PUNJAB: [3, 4], SINDH: [2, 3], KPK: [], BALOCHISTAN: [3, 4, 5] },
        note: 'Balochistan (Turbat) produces the best watermelons in Pakistan. Thrives in hot dry climate.',
    },
    {
        id: 'RICE', name: 'Rice', urdu: 'چاول', emoji: '🌾',
        category: 'Grain', duration: '120–150 days', yieldPerAcre: '25–40 maunds',
        provinces: { PUNJAB: [6, 7], SINDH: [6, 7], KPK: [5, 6], BALOCHISTAN: [] },
        note: 'Kharif season. High water requirement — suited to canal-irrigated areas.',
    },
    {
        id: 'POTATO', name: 'Potato', urdu: 'آلو', emoji: '🥔',
        category: 'Vegetable', duration: '70–100 days', yieldPerAcre: '6–10 tons',
        provinces: { PUNJAB: [10, 11, 1, 2], SINDH: [11, 12], KPK: [2, 3], BALOCHISTAN: [1, 2] },
        note: 'Cool weather crop. Two seasons possible in Punjab plains.',
    },
    {
        id: 'ONION', name: 'Onion', urdu: 'پیاز', emoji: '🧅',
        category: 'Vegetable', duration: '100–120 days', yieldPerAcre: '5–8 tons',
        provinces: { PUNJAB: [10, 11], SINDH: [10, 11, 12], KPK: [3, 4], BALOCHISTAN: [10, 11] },
        note: 'High market demand. Good storage life. Important Rabi crop.',
    },
    {
        id: 'CHILI', name: 'Chili', urdu: 'مرچ', emoji: '🌶️',
        category: 'Vegetable', duration: '90–120 days', yieldPerAcre: '3–6 tons',
        provinces: { PUNJAB: [2, 3], SINDH: [1, 2], KPK: [], BALOCHISTAN: [] },
        note: 'High value spice crop. Requires warm weather and well-drained soil.',
    },
    {
        id: 'SUGARCANE', name: 'Sugarcane', urdu: 'گنا', emoji: '🎋',
        category: 'Cash Crop', duration: '12–14 months', yieldPerAcre: '40–60 tons',
        provinces: { PUNJAB: [2, 3], SINDH: [1, 2], KPK: [2, 3], BALOCHISTAN: [] },
        note: 'Long duration, very high water use. Guaranteed mill purchase in Punjab.',
    },
];

function CropCard({ crop, muted = false }: { crop: any; muted?: boolean }) {
    const catStyle = CATEGORY_COLORS[crop.category] || { bg: T.surface, color: T.muted };

    return (
        <div style={{
            background: muted ? '#FAFAFA' : T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            padding: '16px',
            opacity: muted ? 0.7 : 1,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>
                        {crop.emoji} {crop.name}
                    </div>
                    <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{crop.urdu}</div>
                </div>
                <span style={{
                    background: catStyle.bg, color: catStyle.color,
                    fontSize: 11, fontWeight: 600,
                    padding: '4px 10px', borderRadius: 8,
                }}>
                    {crop.category}
                </span>
            </div>

            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                <div>
                    <div style={{ fontSize: 11, color: T.muted }}>Duration</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{crop.duration}</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: T.muted }}>Yield / Acre</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{crop.yieldPerAcre}</div>
                </div>
            </div>

            <div style={{
                marginTop: 12, fontSize: 12, color: T.muted,
                lineHeight: 1.6, borderTop: `1px solid ${T.border}`, paddingTop: 10,
            }}>
                {crop.note}
            </div>
        </div>
    );
}

export default function CropRecommendationsScreen({ navigate }: { navigate: (s: string) => void }) {
    const currentMonth = new Date().getMonth() + 1;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const [province, setProvince] = useState(
        localStorage.getItem('farmerProvince') || 'PUNJAB'
    );

    const recommended = CROP_DATA.filter(crop =>
        ((crop.provinces as any)[province] || []).includes(currentMonth)
    );

    const upcoming = CROP_DATA.filter(crop => {
        const months = (crop.provinces as any)[province] || [];
        return !months.includes(currentMonth) && months.includes(nextMonth);
    });

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* Header */}
            <div style={{
                background: `linear-gradient(160deg, ${T.green900} 0%, ${T.green700} 100%)`,
                padding: '20px 20px 28px',
                color: 'white',
            }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Crop Recommendations</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                    Best crops to plant in {MONTH_NAMES[currentMonth]}
                </div>
            </div>

            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Province selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: T.muted }}>Your Province</label>
                    <select
                        value={province}
                        onChange={e => setProvince(e.target.value)}
                        style={{
                            padding: '13px 14px', fontSize: 15,
                            border: `1.5px solid ${T.border}`, borderRadius: 12,
                            outline: 'none', background: T.surface, color: T.text,
                        }}
                    >
                        {PROVINCES.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* Plant now */}
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                    Plant Now — {MONTH_NAMES[currentMonth]}
                </div>

                {recommended.length === 0 ? (
                    <div style={{
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 14, padding: '24px 16px',
                        textAlign: 'center', color: T.muted, fontSize: 13,
                    }}>
                        No major crops recommended this month for {PROVINCES.find(p => p.id === province)?.name}.
                    </div>
                ) : (
                    recommended.map(crop => <CropCard key={crop.id} crop={crop} />)
                )}

                {/* Upcoming next month */}
                {upcoming.length > 0 && (
                    <>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginTop: 4 }}>
                            Coming Next Month — {MONTH_NAMES[nextMonth]}
                        </div>
                        {upcoming.map(crop => <CropCard key={crop.id} crop={crop} muted />)}
                    </>
                )}

            </div>
        </div>
    );
}