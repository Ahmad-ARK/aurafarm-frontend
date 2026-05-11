'use client';

import { useState, useEffect } from "react";
import LoginScreen from '@/components/screens/LoginScreen';
import DashboardScreen from "@/components/screens/DashboardScreen";
import { T } from '@/lib/tokens';
import Icon from '@/components/ui/Icon';
import AddPlotScreen from '@/components/screens/AddPlotScreen';
import PlotsScreen from '@/components/screens/PlotsScreen';
import StartCycleScreen from '@/components/screens/StartCycleScreen';
import CycleDetailScreen from '@/components/screens/CycleDetailScreen';
import FertilizerScreen from '@/components/screens/FertilizerScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import AlertsScreen from '@/components/screens/AlertsScreen';
import WeatherScreen from '@/components/screens/WeatherScreen';
import RegisterScreen from '@/components/screens/RegisterScreen';
import SoilEntryScreen from "@/components/screens/SoilEntryScreen";
import DiseaseCheckScreen from '@/components/screens/DiseaseCheckScreen';
import CropRecommendationsScreen from '@/components/screens/CropRecommendationsScreen';

export default function Home() {
  const [screen, setScreen] = useState('login');
  const [history, setHistory] = useState<string[]>([]);
  const [extras, setExtras] = useState<{ cycleId?: string; plotId?: string; plotName?: string }>({});

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setScreen('dashboard');
    }
  }, []);

  function navigate(screenName: string, data?: { cycleId?: string }) {
    setHistory(h => [...h, screen]);
    if (data) setExtras(data);
    setScreen(screenName);
  }

  function goBack() {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setExtras({});
      setScreen(prev);
    }
  }

  function renderScreen() {
    switch (screen) {
      case 'login':
        return <LoginScreen navigate={navigate} />;
      case 'dashboard':
        return <DashboardScreen navigate={navigate} />;
      case 'add-plot':
        return <AddPlotScreen navigate={navigate} />;
      case 'plots':
        return <PlotsScreen navigate={navigate} />;
      case 'start-cycle':
        return <StartCycleScreen navigate={navigate} plotId={extras.plotId} />;
      case 'cycle-detail':
        return <CycleDetailScreen cycleId={extras.cycleId || ''} navigate={navigate} />;
      case 'fertilizer':
        return <FertilizerScreen cycleId={extras.cycleId || ''} navigate={navigate} />;
      case 'profile':
        return <ProfileScreen navigate={navigate} />;
      case 'alerts':
        return <AlertsScreen navigate={navigate} />;
      case 'weather':
        return <WeatherScreen navigate={navigate} />;
      case 'register':
        return <RegisterScreen navigate={navigate} />;
      case 'soil-entry':
        return <SoilEntryScreen plotId={extras.plotId || ''} plotName={extras.plotName || ''} navigate={navigate} />;
      case 'disease-check':
        return <DiseaseCheckScreen cycleId={extras.cycleId} navigate={navigate} />;
      case 'crop-recs':
        return <CropRecommendationsScreen navigate={navigate} />;
      default:
        return <LoginScreen navigate={navigate} />;
    }
  }

  console.log('current screen:', screen);

  return (
    <main style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#1a1a1a',
    }}>
      <div style={{
        width: 390,
        height: 844,
        background: '#FAFAF7',
        borderRadius: 44,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
      }}>

        {/* Screen content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header for inner screens */}
          {['add-plot', 'start-cycle', 'fertilizer', 'alerts', 'cycle-detail', 'weather', 'soil-entry', 'disease-check', 'crop-recs'].includes(screen) && (
            <div style={{
              height: 52,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              background: T.surface,
              borderBottom: `1px solid ${T.border}`,
              flexShrink: 0,
            }}>
              <button
                onClick={goBack}
                style={{
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: T.green800,
                }}
              >
                <Icon name="chevronLeft" size={22} color={T.green800} />
              </button>
              <span style={{ fontSize: 17, fontWeight: 600, color: T.text, marginLeft: 4 }}>
                {screen === 'add-plot' ? 'Add New Plot'
                  : screen === 'start-cycle' ? 'Start New Cycle'
                    : screen === 'fertilizer' ? 'Fertilizer Plan'
                      : screen === 'alerts' ? 'Disease Alerts'
                        : screen === 'cycle-detail' ? 'Crop Cycle'
                          : screen === 'weather' ? '7-Day Forecast'
                            : screen === 'soil-entry' ? 'Soil Lab Data'
                              : screen === 'disease-check' ? 'Disease Scan'
                                : screen === 'crop-recs' ? 'Crop Recommendations'
                                  : ''}
              </span>
            </div>
          )}
          {renderScreen()}
        </div>

        {/* Bottom Nav */}
        {['dashboard', 'plots', 'alerts', 'profile'].includes(screen) && (
          <div style={{
            height: 72,
            background: '#FFFFFF',
            borderTop: `1px solid ${T.border}`,
            display: 'flex',
            flexShrink: 0,
          }}>
            {[
              { id: 'dashboard', label: 'Home', icon: 'home' },
              { id: 'plots', label: 'Plots', icon: 'map' },
              { id: 'alerts', label: 'Alerts', icon: 'alert' },
              { id: 'profile', label: 'Profile', icon: 'user' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: screen === tab.id ? T.green800 : T.muted,
                  fontWeight: screen === tab.id ? 600 : 400,
                  fontSize: 11,
                }}
              >
                <Icon
                  name={tab.icon}
                  size={22}
                  color={screen === tab.id ? T.green800 : T.muted}
                />
                {tab.label}
              </button>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}