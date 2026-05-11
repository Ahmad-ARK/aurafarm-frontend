'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { useTranslation } from '@/lib/useTranslation';

const API = 'https://aurafarm-production-1691.up.railway.app';

type Props = {
    navigate: (s: string) => void;
};

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

export default function RegisterScreen({ navigate }: Props) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1); // 2-step form
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1 fields
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    // Step 2 fields
    const [experience, setExperience] = useState('');
    const [language, setLanguage] = useState('ur');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');

    async function handleRegister() {
        setLoading(true);
        setError('');

        const res = await fetch(`${API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName,
                phoneNumber: phone,
                password,
                preferredLanguage: language,
                farmingExperienceYears: experience ? parseInt(experience) : undefined,
                province: province || undefined,
                district: district || undefined,
            }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            // Auto login after register
            localStorage.setItem('token', data.token);
            localStorage.setItem('farmerId', data.farmer.id);
            localStorage.setItem('farmerName', data.farmer.fullName);
            localStorage.setItem('farmerLanguage', language);
            if (province) localStorage.setItem('farmerProvince', province);
            if (district) localStorage.setItem('farmerDistrict', district);
            navigate('dashboard');
        } else {
            if (data.error === 'PHONE_ALREADY_REGISTERED') {
                setError(t('reg_phone_taken'));
            } else {
                setError(data.error || t('reg_failed'));
            }
            setStep(1); // go back to step 1 on error
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '14px',
        borderRadius: 12,
        border: `1px solid ${T.border}`,
        fontSize: 15,
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

            {/* Green header */}
            <div style={{
                background: `linear-gradient(160deg, ${T.green900} 0%, ${T.green700} 100%)`,
                padding: '40px 24px 32px',
                color: 'white',
            }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{t('reg_create_account')}</div>
                <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>{t('reg_join')}</div>

                {/* Step indicator */}
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{
                            height: 4,
                            flex: 1,
                            borderRadius: 2,
                            background: step >= s ? 'white' : 'rgba(255,255,255,0.3)',
                        }} />
                    ))}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                    {t('reg_step_of', { step })}
                </div>
            </div>

            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {error && (
                    <div style={{
                        background: T.red100,
                        color: T.red500,
                        padding: '12px 14px',
                        borderRadius: 10,
                        fontSize: 13,
                    }}>
                        {error}
                    </div>
                )}

                {/* Step 1 — basic info */}
                {step === 1 && (
                    <>
                        <div>
                            <label style={labelStyle}>{t('reg_full_name')}</label>
                            <input style={inputStyle} placeholder="Ahmad Ali" value={fullName} onChange={e => setFullName(e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>{t('reg_phone')}</label>
                            <input style={inputStyle} placeholder="03001234567" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>{t('reg_password')}</label>
                            <input style={inputStyle} placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <button
                            onClick={() => {
                                if (!fullName || fullName.length < 2) return setError('Name must be at least 2 characters');
                                if (!/^03[0-9]{9}$/.test(phone)) return setError('Enter a valid Pakistani number e.g. 03001234567');
                                if (password.length < 8) return setError('Password must be at least 8 characters');
                                setError(''); setStep(2);
                            }}
                            style={{ background: T.green800, color: 'white', border: 'none', borderRadius: 14, padding: '16px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
                        >
                            {t('reg_next')} →
                        </button>
                    </>
                )}

                {/* Step 2 — location & preferences */}
                {step === 2 && (
                    <>
                        <div>
                            <label style={labelStyle}>{t('reg_province')}</label>
                            <select style={inputStyle} value={province} onChange={e => { setProvince(e.target.value); setDistrict(''); }}>
                                <option value="">{t('reg_select_province')}</option>
                                <option value="PUNJAB">Punjab</option>
                                <option value="SINDH">Sindh</option>
                                <option value="KPK">KPK (Khyber Pakhtunkhwa)</option>
                                <option value="BALOCHISTAN">Balochistan</option>
                            </select>
                        </div>
                        {province && (
                            <div>
                                <label style={labelStyle}>{t('reg_district')}</label>
                                <select style={inputStyle} value={district} onChange={e => setDistrict(e.target.value)}>
                                    <option value="">{t('reg_select_district')}</option>
                                    {DISTRICTS[province].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label style={labelStyle}>{t('reg_experience')}</label>
                            <input style={inputStyle} placeholder={t('reg_exp_placeholder')} type="number" value={experience} onChange={e => setExperience(e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>{t('reg_language')}</label>
                            <select style={inputStyle} value={language} onChange={e => setLanguage(e.target.value)}>
                                <option value="ur">{t('lang_ur')}</option>
                                <option value="en">{t('lang_en')}</option>
                                <option value="pa">{t('lang_pa')}</option>
                            </select>
                        </div>

                        <button
                            onClick={handleRegister}
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
                            {loading ? t('reg_creating') : t('reg_create')}
                        </button>
                        <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 14, cursor: 'pointer', padding: '8px' }}>
                            ← {t('common_cancel')}
                        </button>
                    </>
                )}

                {/* Login link */}
                <div style={{ textAlign: 'center', fontSize: 14, color: T.muted, marginTop: 8 }}>
                    {t('reg_already')}{' '}
                    <span onClick={() => navigate('login')} style={{ color: T.green800, fontWeight: 600, cursor: 'pointer' }}>
                        {t('reg_sign_in')}
                    </span>
                </div>

            </div>
        </div>
    );
}