'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';

const API = 'https://aurafarm-production-1691.up.railway.app';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeatherEmoji(tempMax: number, rainfall: number, humidity: number): string {
    if (rainfall > 5) return '🌧️';
    if (rainfall > 0) return '🌦️';
    if (humidity > 80) return '🌫️';
    if (tempMax > 38) return '🌡️';
    if (tempMax > 30) return '☀️';
    return '⛅';
}

type Props = {
    navigate: (s: string, data?: { cycleId?: string }) => void;
};

export default function WeatherScreen({ navigate }: Props) {
    const token = localStorage.getItem('token') || '';
    const farmerId = localStorage.getItem('farmerId') || '';

    const [plots, setPlots] = useState<any[]>([]);
    const [selectedPlot, setSelectedPlot] = useState<any>(null);
    const [forecast, setForecast] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [error, setError] = useState('');

    // Load plots on mount
    useEffect(() => {
        async function loadPlots() {
            const res = await fetch(`${API}/api/farm-plots/farmer/${farmerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.length > 0) {
                setPlots(data);
                setSelectedPlot(data[0]);
            } else {
                setError('No plots found. Add a plot first.');
            }
            setLoading(false);
        }
        loadPlots();
    }, []);

    // Fetch weather whenever selected plot changes
    useEffect(() => {
        if (!selectedPlot) return;

        async function loadWeather() {
            setWeatherLoading(true);
            const res = await fetch(
                `${API}/api/weather?lat=${selectedPlot.latitude}&lng=${selectedPlot.longitude}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (res.ok) setForecast(data);
            setWeatherLoading(false);
        }
        loadWeather();
    }, [selectedPlot]);

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, padding: 24, textAlign: 'center' }}>
                {error}
            </div>
        );
    }

    const today = forecast[0];

    return (
        <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* Blue hero */}
            <div style={{
                background: 'linear-gradient(160deg, #1565C0 0%, #1976D2 100%)',
                padding: '24px 20px 32px',
                color: 'white',
            }}>

                {/* Plot selector dropdown */}
                <select
                    value={selectedPlot?.id || ''}
                    onChange={e => {
                        const plot = plots.find(p => p.id === e.target.value);
                        if (plot) setSelectedPlot(plot);
                    }}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.4)',
                        borderRadius: 10,
                        padding: '8px 12px',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        marginBottom: 12,
                        width: '100%',
                        outline: 'none',
                    }}
                >
                    {plots.map(p => (
                        <option key={p.id} value={p.id} style={{ color: T.text, background: 'white' }}>
                            📍 {p.plotName || 'Unnamed Plot'}
                        </option>
                    ))}
                </select>

                <div style={{ fontSize: 13, opacity: 0.8 }}>Today</div>

                {weatherLoading ? (
                    <div style={{ fontSize: 16, marginTop: 16, opacity: 0.8 }}>Loading weather...</div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                            <div style={{ fontSize: 64 }}>
                                {today ? getWeatherEmoji(today.tempMaxC, today.rainfallMm, today.humidityPct) : '☀️'}
                            </div>
                            <div>
                                <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}>
                                    {today ? Math.round(today.tempAvgC) : '--'}°C
                                </div>
                                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                                    {today ? `${Math.round(today.tempMinC)}° – ${Math.round(today.tempMaxC)}°` : ''}
                                </div>
                            </div>
                        </div>

                        {today && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20 }}>
                                {[
                                    { label: 'Humidity', value: `${today.humidityPct}%` },
                                    { label: 'Rainfall', value: `${today.rainfallMm} mm` },
                                    { label: 'Wind', value: `${today.windSpeedKmh} km/h` },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        background: 'rgba(255,255,255,0.15)',
                                        borderRadius: 10,
                                        padding: '10px',
                                        textAlign: 'center',
                                    }}>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</div>
                                        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* 7-day list */}
                {!weatherLoading && (
                    <div style={{
                        background: T.surface,
                        borderRadius: 16,
                        border: `1px solid ${T.border}`,
                        overflow: 'hidden',
                    }}>
                        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>7-Day Forecast</div>
                        </div>

                        {forecast.map((day: any, i: number) => {
                            const date = new Date(day.date);
                            const dayLabel = i === 0 ? 'Today' : DAYS[date.getDay()];

                            return (
                                <div
                                    key={day.date}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        borderBottom: i < forecast.length - 1 ? `1px solid ${T.border}` : 'none',
                                        gap: 12,
                                    }}
                                >
                                    <div style={{ width: 44, fontSize: 13, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? T.green800 : T.text }}>
                                        {dayLabel}
                                    </div>
                                    <div style={{ fontSize: 22, width: 32 }}>
                                        {getWeatherEmoji(day.tempMaxC, day.rainfallMm, day.humidityPct)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ fontSize: 11, color: T.muted, width: 28 }}>{day.humidityPct}%</div>
                                            <div style={{ flex: 1, height: 4, borderRadius: 2, background: T.border, overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${day.humidityPct}%`,
                                                    height: '100%',
                                                    background: day.humidityPct > 80 ? '#EF5350' : '#42A5F5',
                                                    borderRadius: 2,
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: 60 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{Math.round(day.tempMaxC)}°</span>
                                        <span style={{ fontSize: 13, color: T.muted }}> / {Math.round(day.tempMinC)}°</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{
                    background: T.amber100,
                    borderRadius: 14,
                    padding: '14px 16px',
                    fontSize: 13,
                    color: '#92400E',
                }}>
                    💡 High humidity (&gt;80%) for consecutive days increases disease risk. Check your alerts regularly.
                </div>

            </div>
        </div>
    );
}