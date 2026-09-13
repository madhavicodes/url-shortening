import React, { useCallback, useEffect, useState } from 'react';
import { DEFAULT_GRADIENT, getCssGradient } from './utils/gradients';
import { authService, isUserAdmin } from './utils/authService';
import { getPublicShortOrigin } from './utils/apiClient';
import { fetchStats, fetchUrls } from './utils/urlApi';
import { Navbar } from './components/Navbar';
import { UrlShortenerView } from './components/UrlShortenerView';
import { ArchitectureVisualizer } from './components/ArchitectureVisualizer';
import { Base62Explorer } from './components/Base62Explorer';
import { CapacityCalculator } from './components/CapacityCalculator';
import { SystemDesignNotes } from './components/SystemDesignNotes';
import { AnalyticsModal } from './components/AnalyticsModal';
import { GradientShowcaseModal } from './components/GradientShowcaseModal';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileDashboard } from './components/UserProfileDashboard';
import { Palette, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const publicOrigin = getPublicShortOrigin();
  const publicHost = publicOrigin.replace(/^https?:\/\//, '');

  const [activeTab, setActiveTab] = useState('shortener');
  const [urls, setUrls] = useState([]);
  const [currentCounter, setCurrentCounter] = useState(0);
  const [cacheCount, setCacheCount] = useState(0);
  const [currentTrace, setCurrentTrace] = useState(null);
  const [analyticsUrl, setAnalyticsUrl] = useState(null);
  const [activeGradient, setActiveGradient] = useState(DEFAULT_GRADIENT);
  const [showGradientsModal, setShowGradientsModal] = useState(false);
  const [shareModalRecord, setShareModalRecord] = useState(null);
  const [shortDomain, setShortDomain] = useState(publicHost);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [apiError, setApiError] = useState(null);
  const [ready, setReady] = useState(false);

  const isAdmin = isUserAdmin(currentUser);

  const handleRefresh = useCallback(async () => {
    try {
      const [nextUrls, stats] = await Promise.all([fetchUrls(), fetchStats()]);
      setUrls(nextUrls);
      setCurrentCounter(stats.counter || 0);
      setCacheCount(stats.cacheCount || 0);
      setApiError(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'API unavailable');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await authService.restoreSession();
      if (!cancelled) {
        setCurrentUser(user);
        await handleRefresh();
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handleRefresh]);

  useEffect(() => {
    const labTabs = ['architecture', 'base62', 'capacity', 'interview-guide'];
    if (!isAdmin && labTabs.includes(activeTab)) {
      setActiveTab('shortener');
    }
    if (!currentUser && activeTab === 'dashboard') {
      setActiveTab('shortener');
    }
  }, [isAdmin, currentUser, activeTab]);

  const handleUserChange = async (user) => {
    setCurrentUser(user);
    await handleRefresh();
    const labTabs = ['architecture', 'base62', 'capacity', 'interview-guide'];
    if (!isUserAdmin(user) && labTabs.includes(activeTab)) {
      setActiveTab('shortener');
    }
    if (!user && activeTab === 'dashboard') {
      setActiveTab('shortener');
    }
  };

  const userUrlsCount = currentUser
    ? urls.filter((item) => item.createdBy?.toLowerCase() === currentUser.username?.toLowerCase()).length
    : 0;

  if (!ready) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center text-sm text-white">
        Connecting to ShortScale API…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col font-sans selection:bg-[#ff0084] selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cacheCount={cacheCount}
        currentCounter={currentCounter}
        activeGradient={activeGradient}
        onOpenGradients={() => setShowGradientsModal(true)}
        onOpenShare={(record) =>
          setShareModalRecord(record || { shortCode: '', originalUrl: 'ShortScale URL Shortener' })
        }
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setShowAuthModal(true);
        }}
        onUserChange={handleUserChange}
        userUrlsCount={userUrlsCount}
      />

      {apiError && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-800 text-xs px-4 py-2 text-center">
          API error: {apiError}. Start Postgres, Redis, and the API with `npm run docker:up` then `npm run dev:server`.
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'shortener' && (
          <UrlShortenerView
            urls={urls}
            onRefresh={handleRefresh}
            onSelectTrace={setCurrentTrace}
            onOpenAnalytics={(url) => setAnalyticsUrl(url)}
            onOpenShare={(record) => setShareModalRecord(record)}
            activeGradient={activeGradient}
            onOpenGradients={() => setShowGradientsModal(true)}
            shortDomain={shortDomain}
            onSetShortDomain={setShortDomain}
            currentUser={currentUser}
            isAdmin={isAdmin}
            onOpenAuth={(mode) => {
              setAuthModalMode(mode || 'login');
              setShowAuthModal(true);
            }}
            onNavigateTab={(tab) => {
              if (tab === 'dashboard' && currentUser) {
                setActiveTab(tab);
                return;
              }
              if (tab !== 'shortener' && !isAdmin) return;
              setActiveTab(tab);
            }}
          />
        )}

        {currentUser && activeTab === 'dashboard' && (
          <UserProfileDashboard
            currentUser={currentUser}
            onUpdateUser={handleUserChange}
            onOpenAuth={(mode) => {
              setAuthModalMode(mode || 'login');
              setShowAuthModal(true);
            }}
            urls={urls}
            onRefreshUrls={handleRefresh}
            onSelectTrace={setCurrentTrace}
            onOpenAnalytics={(url) => setAnalyticsUrl(url)}
            onOpenShare={(record) => setShareModalRecord(record)}
            activeGradient={activeGradient}
            shortDomain={shortDomain}
          />
        )}

        {isAdmin && activeTab === 'architecture' && (
          <ArchitectureVisualizer
            currentTrace={currentTrace}
            onRunNewTrace={setCurrentTrace}
            cacheCount={cacheCount}
            currentCounter={currentCounter}
            activeGradient={activeGradient}
            urls={urls}
          />
        )}

        {isAdmin && activeTab === 'base62' && (
          <Base62Explorer activeGradient={activeGradient} shortDomain={shortDomain} />
        )}

        {isAdmin && activeTab === 'capacity' && <CapacityCalculator activeGradient={activeGradient} />}

        {isAdmin && activeTab === 'interview-guide' && <SystemDesignNotes activeGradient={activeGradient} />}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleUserChange}
      />

      {analyticsUrl && (
        <AnalyticsModal
          url={analyticsUrl}
          activeGradient={activeGradient}
          shortDomain={shortDomain}
          onClose={() => setAnalyticsUrl(null)}
          onOpenShare={(record) => setShareModalRecord(record)}
        />
      )}

      {showGradientsModal && (
        <GradientShowcaseModal
          activeGradient={activeGradient}
          onSelectGradient={setActiveGradient}
          onClose={() => setShowGradientsModal(false)}
        />
      )}

      {shareModalRecord && (
        <ShareModal
          urlRecord={shareModalRecord.shortCode ? shareModalRecord : null}
          activeGradient={activeGradient}
          shortDomain={shortDomain}
          onClose={() => setShareModalRecord(null)}
        />
      )}

      <footer className="glass-panel border-t border-white/15 text-white/80 py-6 text-xs rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-[11px]"
              style={{ background: getCssGradient(activeGradient) }}
            >
              S
            </div>
            <span className="font-semibold text-white">ShortScale</span>
            <span className="text-white/40">|</span>
            <span>Postgres + Redis API • real 302 redirects</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowGradientsModal(true)}
              className="text-[#ff0084] hover:underline font-mono text-[11px] flex items-center space-x-1"
            >
              <Palette className="w-3 h-3" />
              <span>Theme</span>
            </button>
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shared database</span>
            </span>
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Redis counter</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
