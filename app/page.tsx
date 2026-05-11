'use client';

import { useState, useEffect, useRef } from "react";
import { useTranslation } from '@/lib/useTranslation';
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

// Tab screens kept alive once visited — no reload when switching tabs
const TAB_SCREENS = ['dashboard', 'plots', 'alerts', 'profile'] as const;

// Inner screens always remounted (need fresh data each visit)
const INNER_SCREENS = [
  'add-plot', 'start-cycle', 'fertilizer', 'cycle-detail',
  'weather', 'soil-entry', 'disease-check', 'crop-recs',
];

export default function Home() {
  const { t, isUrdu } = useTranslation();
  const [screen, setScreen] = useState('login');
  // True when running as installed Android/iOS app — removes desktop mockup
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { setIsMobile(window.innerWidth <= 480); }, []);
  type Extras = { cycleId?: string; plotId?: string; plotName?: string };
  // History stores screen name + the extras that were active at that point
  const [history, setHistory] = useState<Array<{ screen: string; extras: Extras }>>([]);
  const [extras, setExtras] = useState<Extras>({});
  // Track which tab screens have been mounted at least once
  const [visited, setVisited] = useState<Set<string>>(new Set<string>());
  // Bump a tab's key to force it to remount and re-fetch (used after data mutations)
  const [tabKeys, setTabKeys] = useState<Record<string, number>>({ dashboard: 0, plots: 0, alerts: 0, profile: 0 });
  function refreshTab(tab: string) {
    setTabKeys(k => ({ ...k, [tab]: (k[tab] ?? 0) + 1 }));
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setScreen('dashboard');
      setVisited(new Set(['dashboard']));
    }
  }, []);

  function navigate(screenName: string, data?: Extras) {
    // Save current screen + current extras so goBack() can fully restore them
    setHistory(h => [...h, { screen, extras }]);
    setExtras(data ?? {});
    setScreen(screenName);
    if ((TAB_SCREENS as readonly string[]).includes(screenName)) {
      setVisited(v => new Set([...v, screenName]));
      // Always refresh tab screens so data stays current after any action
      refreshTab(screenName);
    }
  }

  function goBack() {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setExtras(prev.extras);   // Restore previous extras (cycleId etc.) — fixes stuck loading
      setScreen(prev.screen);
      // Refresh if going back to a tab screen
      if ((TAB_SCREENS as readonly string[]).includes(prev.screen)) {
        refreshTab(prev.screen);
      }
    }
  }

  function renderInnerScreen() {
    switch (screen) {
      case 'login':    return <LoginScreen navigate={navigate} />;
      case 'register': return <RegisterScreen navigate={navigate} />;
      case 'add-plot': return <AddPlotScreen navigate={navigate} />;
      case 'start-cycle':
        return <StartCycleScreen navigate={navigate} plotId={extras.plotId} />;
      case 'cycle-detail':
        return <CycleDetailScreen cycleId={extras.cycleId || ''} navigate={navigate} />;
      case 'fertilizer':
        return <FertilizerScreen cycleId={extras.cycleId || ''} navigate={navigate} />;
      case 'weather':  return <WeatherScreen navigate={navigate} />;
      case 'soil-entry':
        return <SoilEntryScreen plotId={extras.plotId || ''} plotName={extras.plotName || ''} navigate={navigate} />;
      case 'disease-check':
        return <DiseaseCheckScreen cycleId={extras.cycleId} navigate={navigate} />;
      case 'crop-recs': return <CropRecommendationsScreen navigate={navigate} />;
      default: return null;
    }
  }

  const isLoggedIn = !['login', 'register'].includes(screen);
  const isTabScreen = (TAB_SCREENS as readonly string[]).includes(screen);
  const isInnerScreen = INNER_SCREENS.includes(screen) || ['login', 'register'].includes(screen);

  // Desktop: show phone mockup. Mobile/native: fill the whole screen.
  const phoneStyle: React.CSSProperties = isMobile ? {
    width: '100%',
    height: '100%',
    background: '#FAFAF7',
    borderRadius: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: isUrdu ? "'Gulzar', serif" : undefined,
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  } : {
    width: 390,
    height: 844,
    background: '#FAFAF7',
    borderRadius: 44,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
    fontFamily: isUrdu ? "'Gulzar', serif" : undefined,
  };

  return (
    <main style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      height: isMobile ? '100dvh' : undefined,
      background: '#1a1a1a',
      overflow: isMobile ? 'hidden' : undefined,
    }}>
      <div
        dir={isUrdu ? 'rtl' : 'ltr'}
        style={phoneStyle}>

        {/* Screen content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Header — shown for inner screens that have a back button */}
          {INNER_SCREENS.includes(screen) && (
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
                <Icon name={isUrdu ? 'chevronRight' : 'chevronLeft'} size={22} color={T.green800} />
              </button>
              <span style={{ fontSize: 17, fontWeight: 600, color: T.text, marginLeft: isUrdu ? 0 : 4, marginRight: isUrdu ? 4 : 0 }}>
                {screen === 'add-plot' ? t('title_add_plot')
                  : screen === 'start-cycle' ? t('title_start_cycle')
                    : screen === 'fertilizer' ? t('title_fertilizer')
                      : screen === 'alerts' ? t('title_alerts')
                        : screen === 'cycle-detail' ? t('title_cycle_detail')
                          : screen === 'weather' ? t('title_weather')
                            : screen === 'soil-entry' ? t('title_soil_entry')
                              : screen === 'disease-check' ? t('title_disease_check')
                                : screen === 'crop-recs' ? t('title_crop_recs')
                                  : ''}
              </span>
            </div>
          )}

          {/* ── TAB SCREENS: mounted once, shown/hidden via CSS ── */}
          {isLoggedIn && (
            <>
              {visited.has('dashboard') && (
                <div style={{ display: screen === 'dashboard' ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
                  <DashboardScreen key={tabKeys.dashboard} navigate={navigate} />
                </div>
              )}
              {visited.has('plots') && (
                <div style={{ display: screen === 'plots' ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
                  <PlotsScreen key={tabKeys.plots} navigate={navigate} />
                </div>
              )}
              {visited.has('alerts') && (
                <div style={{ display: screen === 'alerts' ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
                  <AlertsScreen key={tabKeys.alerts} navigate={navigate} />
                </div>
              )}
              {visited.has('profile') && (
                <div style={{ display: screen === 'profile' ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
                  <ProfileScreen key={tabKeys.profile} navigate={navigate} />
                </div>
              )}
            </>
          )}

          {/* ── INNER / AUTH SCREENS: remounted each visit ── */}
          {isInnerScreen && renderInnerScreen()}

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
              { id: 'dashboard', label: t('nav_home'), icon: 'home' },
              { id: 'plots', label: t('nav_plots'), icon: 'map' },
              { id: 'alerts', label: t('nav_alerts'), icon: 'alert' },
              { id: 'profile', label: t('nav_profile'), icon: 'user' },
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