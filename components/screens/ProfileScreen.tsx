'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import Icon from '@/components/ui/Icon';
import { useTranslation } from '@/lib/useTranslation';

const API = 'https://aurafarm-production-1691.up.railway.app';

const DISTRICTS: Record<string, string[]> = {
    PUNJAB: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan', 'Sialkot',
        'Bahawalpur', 'Sargodha', 'Okara', 'Sahiwal', 'Sheikhupura', 'Gujrat',
        'Rahim Yar Khan', 'Kasur', 'Dera Ghazi Khan'],
    SINDH: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpurkhas',
        'Nawabshah', 'Thatta', 'Khairpur', 'Jacobabad', 'Shikarpur'],
    KPK: ['Peshawar', 'Mardan', 'Swat', 'Abbottabad', 'Mansehra',
        'Nowshera', 'Charsadda', 'Kohat', 'Bannu', 'Dera Ismail Khan'],
    BALOCHISTAN: ['Quetta', 'Turbat', 'Khuzdar', 'Gwadar', 'Hub',
        'Loralai', 'Zhob', 'Pishin', 'Chaman', 'Sibi'],
};

type Props = {
    navigate: (s: string, data?: { cycleId?: string }) => void;
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    fontSize: 14,
    color: T.text,
    background: 'white',
    boxSizing: 'border-box',
};

export default function ProfileScreen({ navigate }: Props) {
    const { t } = useTranslation();
    const token = localStorage.getItem('token') || '';
    const farmerId = localStorage.getItem('farmerId') || '';

    const [farmer, setFarmer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Edit form state
    const [fullName, setFullName] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [experience, setExperience] = useState('');
    const [language, setLanguage] = useState('ur');

    useEffect(() => {
        const id = localStorage.getItem('farmerId') || '';
        const tok = localStorage.getItem('token') || '';
        if (!id || !tok) { setLoading(false); return; }

        async function loadFarmer() {
            try {
                const res = await fetch(`${API}/api/farmers/${id}`, {
                    headers: { Authorization: `Bearer ${tok}` },
                });
                const data = await res.json();
                if (res.ok) {
                    setFarmer(data);
                    setFullName(data.fullName || '');
                    setProvince(data.province || '');
                    setDistrict(data.district || '');
                    setExperience(data.farmingExperienceYears?.toString() || '');
                    setLanguage(data.preferredLanguage || 'ur');
                }
            } catch { /* network error — fall through to show empty state */ }
            finally { setLoading(false); }
        }
        loadFarmer();
    }, []);

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('farmerId');
        localStorage.removeItem('farmerName');
        localStorage.removeItem('farmerProvince');
        localStorage.removeItem('farmerDistrict');
        localStorage.removeItem('farmerLanguage');
        navigate('login');
    }

    function handleEditToggle() {
        if (editing) {
            // Cancel — reset fields back to saved values
            setFullName(farmer.fullName || '');
            setProvince(farmer.province || '');
            setDistrict(farmer.district || '');
            setExperience(farmer.farmingExperienceYears?.toString() || '');
            setLanguage(farmer.preferredLanguage || 'ur');
            setSaveError('');
        }
        setEditing(e => !e);
    }

    async function handleSave() {
        setSaving(true);
        setSaveError('');
        try {
            const res = await fetch(`${API}/api/farmers/${farmerId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fullName: fullName.trim() || undefined,
                    province: province || undefined,
                    district: district || undefined,
                    farmingExperienceYears: experience ? parseInt(experience) : undefined,
                    preferredLanguage: language,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                setSaveError(err.error || t('profile_failed'));
                return;
            }

            const updated = await res.json();
            setFarmer(updated);
            // Sync localStorage
            if (updated.fullName) localStorage.setItem('farmerName', updated.fullName);
            if (updated.province) localStorage.setItem('farmerProvince', updated.province);
            if (updated.district) localStorage.setItem('farmerDistrict', updated.district);
            // Sync language and reload so new language applies immediately
            if (updated.preferredLanguage) {
                localStorage.setItem('farmerLanguage', updated.preferredLanguage);
            }
            setEditing(false);
            window.location.reload();
        } catch {
            setSaveError(t('common_failed'));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                {t('profile_loading')}
            </div>
        );
    }

    const langLabel = (lang: string) =>
        lang === 'ur' ? t('lang_ur') : lang === 'pa' ? t('lang_pa') : t('lang_en');

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* Green header */}
            <div style={{
                background: `linear-gradient(160deg, ${T.green900} 0%, ${T.green700} 100%)`,
                padding: '32px 20px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: 'white',
            }}>
                <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 700,
                    marginBottom: 12,
                }}>
                    {farmer?.fullName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{farmer?.fullName}</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{farmer?.phoneNumber}</div>
            </div>

            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Info / Edit card */}
                <div style={{
                    background: T.surface,
                    borderRadius: 16,
                    border: `1px solid ${T.border}`,
                    overflow: 'hidden',
                }}>
                    {/* Card header row */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: `1px solid ${T.border}`,
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{t('profile_details')}</div>
                        <button
                            onClick={handleEditToggle}
                            style={{
                                background: editing ? T.surface : T.green50,
                                color: editing ? T.muted : T.green800,
                                border: `1px solid ${editing ? T.border : T.green800}`,
                                borderRadius: 8,
                                padding: '5px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                            }}
                        >
                            <Icon name={editing ? 'close' : 'edit'} size={12} color={editing ? T.muted : T.green800} />
                            {editing ? t('profile_cancel') : t('profile_edit')}
                        </button>
                    </div>

                    {editing ? (
                        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Full name */}
                            <div>
                                <div style={{ fontSize: 12, color: T.muted, marginBottom: 5 }}>{t('profile_full_name')}</div>
                                <input
                                    style={inputStyle}
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder={t('profile_name_placeholder')}
                                />
                            </div>

                            {/* Province */}
                            <div>
                                <div style={{ fontSize: 12, color: T.muted, marginBottom: 5 }}>{t('profile_province')}</div>
                                <select
                                    style={inputStyle}
                                    value={province}
                                    onChange={e => { setProvince(e.target.value); setDistrict(''); }}
                                >
                                    <option value="">{t('profile_select_prov')}</option>
                                    <option value="PUNJAB">Punjab</option>
                                    <option value="SINDH">Sindh</option>
                                    <option value="KPK">KPK (Khyber Pakhtunkhwa)</option>
                                    <option value="BALOCHISTAN">Balochistan</option>
                                </select>
                            </div>

                            {/* District */}
                            {province && (
                                <div>
                                    <div style={{ fontSize: 12, color: T.muted, marginBottom: 5 }}>{t('profile_district')}</div>
                                    <select
                                        style={inputStyle}
                                        value={district}
                                        onChange={e => setDistrict(e.target.value)}
                                    >
                                        <option value="">{t('profile_select_dist')}</option>
                                        {DISTRICTS[province].map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Experience */}
                            <div>
                                <div style={{ fontSize: 12, color: T.muted, marginBottom: 5 }}>{t('reg_experience')}</div>
                                <input
                                    style={inputStyle}
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={experience}
                                    onChange={e => setExperience(e.target.value)}
                                    placeholder={t('profile_exp_placeholder')}
                                />
                            </div>

                            {/* Language */}
                            <div>
                                <div style={{ fontSize: 12, color: T.muted, marginBottom: 5 }}>{t('reg_language')}</div>
                                <select
                                    style={inputStyle}
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                >
                                    <option value="ur">{t('lang_ur')}</option>
                                    <option value="en">{t('lang_en')}</option>
                                    <option value="pa">{t('lang_pa')}</option>
                                </select>
                            </div>

                            {saveError && (
                                <div style={{
                                    background: '#FFEBEE',
                                    border: '1px solid #FFCDD2',
                                    borderRadius: 8,
                                    padding: '8px 12px',
                                    fontSize: 13,
                                    color: '#C62828',
                                }}>
                                    {saveError}
                                </div>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    background: saving ? T.muted : T.green800,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '12px',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    width: '100%',
                                }}
                            >
                                {saving ? t('profile_saving') : t('profile_save')}
                            </button>
                        </div>
                    ) : (
                        <>
                            {[
                                { label: t('profile_province'), value: farmer?.province || '—' },
                                { label: t('profile_district'), value: farmer?.district || '—' },
                                {
                                    label: t('profile_experience'),
                                    value: farmer?.farmingExperienceYears
                                        ? `${farmer.farmingExperienceYears} ${t('common_years')}`
                                        : '—',
                                },
                                { label: t('profile_language'), value: langLabel(farmer?.preferredLanguage) },
                                { label: t('profile_total_plots'), value: farmer?.plots?.length ?? 0 },
                            ].map((row, i, arr) => (
                                <div
                                    key={row.label}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '14px 16px',
                                        borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
                                    }}
                                >
                                    <div style={{ fontSize: 13, color: T.muted }}>{row.label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{row.value}</div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* App info card */}
                <div style={{
                    background: T.surface,
                    borderRadius: 16,
                    border: `1px solid ${T.border}`,
                    overflow: 'hidden',
                }}>
                    {[
                        { label: t('profile_app_version'), value: '1.0.0' },
                        { label: t('profile_crop'), value: `${t('cycle_tomato')} (Pakistan)` },
                    ].map((row, i, arr) => (
                        <div
                            key={row.label}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 16px',
                                borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
                            }}
                        >
                            <div style={{ fontSize: 13, color: T.muted }}>{row.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{row.value}</div>
                        </div>
                    ))}
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    style={{
                        background: T.red100,
                        color: T.red500,
                        border: 'none',
                        borderRadius: 14,
                        padding: '16px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: 4,
                    }}
                >
                    {t('profile_logout')}
                </button>

            </div>
        </div>
    );
}
