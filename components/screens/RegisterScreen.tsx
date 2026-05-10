'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';

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
            if (province) localStorage.setItem('farmerProvince', province);
            if (district) localStorage.setItem('farmerDistrict', district);
            navigate('dashboard');
        } else {
            if (data.error === 'PHONE_ALREADY_REGISTERED') {
                setError('This phone number is already registered.');
            } else {
                setError(data.error || 'Registration failed. Please try again.');
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
                <div style={{ fontSize: 24, fontWeight: 700 }}>Create Account</div>
                <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>Join AuraFarm today</div>

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
                    Step {step} of 2
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
                            <label style={labelStyle}>Full Name</label>
                            <input
                                style={inputStyle}
                                placeholder="e.g. Ahmad Ali"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Phone Number</label>
                            <input
                                style={inputStyle}
                                placeholder="03001234567"
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Password</label>
                            <input
                                style={inputStyle}
                                placeholder="Min 8 characters"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => {
                                if (!fullName || fullName.length < 2) return setError('Name must be at least 2 characters');
                                if (!/^03[0-9]{9}$/.test(phone)) return setError('Enter a valid Pakistani number e.g. 03001234567');
                                if (password.length < 8) return setError('Password must be at least 8 characters');
                                setError('');
                                setStep(2);
                            }}
                            style={{
                                background: T.green800,
                                color: 'white',
                                border: 'none',
                                borderRadius: 14,
                                padding: '16px',
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                                marginTop: 4,
                            }}
                        >
                            Continue →
                        </button>
                    </>
                )}

                {/* Step 2 — location & preferences */}
                {step === 2 && (
                    <>
                        <div>
                            <label style={labelStyle}>Province</label>
                            <select
                                style={inputStyle}
                                value={province}
                                onChange={e => { setProvince(e.target.value); setDistrict(''); }}
                            >
                                <option value="">Select province</option>
                                <option value="PUNJAB">Punjab</option>
                                <option value="SINDH">Sindh</option>
                                <option value="KPK">KPK (Khyber Pakhtunkhwa)</option>
                                <option value="BALOCHISTAN">Balochistan</option>
                            </select>
                        </div>

                        {province && (
                            <div>
                                <label style={labelStyle}>District</label>
                                <select
                                    style={inputStyle}
                                    value={district}
                                    onChange={e => setDistrict(e.target.value)}
                                >
                                    <option value="">Select district</option>
                                    {DISTRICTS[province].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label style={labelStyle}>Farming Experience (years)</label>
                            <input
                                style={inputStyle}
                                placeholder="e.g. 5 (optional)"
                                type="number"
                                value={experience}
                                onChange={e => setExperience(e.target.value)}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Preferred Language</label>
                            <select
                                style={inputStyle}
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                            >
                                <option value="ur">اردو (Urdu)</option>
                                <option value="en">English</option>
                                <option value="pa">پنجابی (Punjabi)</option>
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
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>

                        <button
                            onClick={() => setStep(1)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: T.muted,
                                fontSize: 14,
                                cursor: 'pointer',
                                padding: '8px',
                            }}
                        >
                            ← Back
                        </button>
                    </>
                )}

                {/* Login link */}
                <div style={{ textAlign: 'center', fontSize: 14, color: T.muted, marginTop: 8 }}>
                    Already have an account?{' '}
                    <span
                        onClick={() => navigate('login')}
                        style={{ color: T.green800, fontWeight: 600, cursor: 'pointer' }}
                    >
                        Sign in
                    </span>
                </div>

            </div>
        </div>
    );
}