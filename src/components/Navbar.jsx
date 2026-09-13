import React, { useEffect, useRef, useState } from 'react';
import { getCssGradient } from '../utils/gradients';
import { shareOnTwitter, shareOnFacebook } from '../utils/socialShare';
import { DEMO_ACCOUNTS, authService, isUserAdmin } from '../utils/authService';
import {
  Link2,
  Network,
  Binary,
  Calculator,
  BookOpen,
  Zap,
  Share2,
  Twitter,
  Facebook,
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
  Shield,
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  cacheCount,
  currentCounter,
  activeGradient,
  onOpenGradients,
  onOpenShare,
  currentUser,
  onOpenAuth,
  onUserChange,
  userUrlsCount = 0,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const shareMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const isAdmin = isUserAdmin(currentUser);

  // For normal user: ONLY show the URL Shortener
  // For role admin: show all architecture, engine, and system details
  const allTabs = [
    { id: 'shortener', label: 'URL Shortener', icon: Link2, adminOnly: false },
    {
      id: 'dashboard',
      label: currentUser ? `${currentUser.fullName?.split(' ')[0]}'s Dashboard` : 'My Dashboard',
      icon: LayoutDashboard,
      badge: currentUser ? userUrlsCount : null,
      adminOnly: false,
      authRequired: true,
    },
    { id: 'architecture', label: 'System Architecture & Trace', icon: Network, adminOnly: true },
    { id: 'base62', label: 'Base62 & Counter Engine', icon: Binary, adminOnly: true },
    { id: 'capacity', label: 'Scale Calculator (1B URLs)', icon: Calculator, adminOnly: true },
    { id: 'interview-guide', label: 'System Design Cheatsheet', icon: BookOpen, adminOnly: true },
  ];

  const tabs = allTabs.filter((tab) => {
    if (tab.adminOnly && !isAdmin) return false;
    if (tab.authRequired && !currentUser) return false;
    return true;
  });

  const handleTwitterShare = () => {
    setShowShareMenu(false);
    shareOnTwitter(
      typeof window !== 'undefined' ? window.location.href : '',
      'ShortScale: High-Scale URL Shortener Simulator with Base62 & Redis Counter'
    );
  };

  const handleFacebookShare = () => {
    setShowShareMenu(false);
    shareOnFacebook(typeof window !== 'undefined' ? window.location.href : '');
  };

  return (
    <header className="bg-transparent/80 backdrop-blur-xl border-b border-white/15 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('shortener')}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/20 transition-transform hover:scale-105"
              style={{ background: getCssGradient(activeGradient) }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Short<span style={{ color: activeGradient?.from || '#ff0084' }}>Scale</span>
                </span>
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border hidden sm:inline-block"
                  style={{
                    backgroundColor: `${activeGradient?.from || '#ff0084'}1a`,
                    color: activeGradient?.from || '#ff0084',
                    borderColor: `${activeGradient?.from || '#ff0084'}40`,
                  }}
                >
                  Distributed
                </span>
              </div>
              <p className="text-xs text-white/70 hidden sm:block">URL Shortener System Design Lab</p>
            </div>
          </div>

          {/* Right Controls: Role Badge + Telemetry (Admin) + Show all gradients + Share buttons + User Auth */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Active Role Badge & Quick Switcher */}
            <div className="flex items-center">
              {isAdmin ? (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs">
                  <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="font-bold text-[11px] hidden sm:inline">Role: Admin</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white/10 border border-white/20 text-white text-xs">
                  <User className="w-3.5 h-3.5 text-white/80 shrink-0" />
                  <span className="font-bold text-[11px] hidden sm:inline">
                    {currentUser ? 'Role: User' : 'Guest'}
                  </span>
                </div>
              )}
            </div>

            {/* System Telemetry Indicators (Desktop - Admin Only) */}
            {isAdmin && (
              <div className="hidden xl:flex items-center space-x-2 text-xs animate-in fade-in">
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-400 font-medium">Counter:</span>
                  <span className="font-mono text-amber-200 font-bold">{currentCounter.toLocaleString()}</span>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-slate-400 font-medium">Cache:</span>
                  <span className="font-mono text-amber-300 font-bold">{cacheCount} hot</span>
                </div>
              </div>
            )}

            {/* "Show all gradients" Button */}
            <button
              id="btn-show-all-gradients"
              onClick={onOpenGradients}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white transition-all hover:border-white/40 shadow-xs cursor-pointer"
              title="View and choose design gradients"
            >
              <div
                className="w-3.5 h-3.5 rounded-full ring-1 ring-white/30 shrink-0"
                style={{ background: getCssGradient(activeGradient) }}
              />
              <span className="hidden sm:inline">Theme</span>
            </button>

            {/* Share dropdown menu */}
            <div className="relative" ref={shareMenuRef}>
              <button
                id="btn-navbar-share"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-md transition-all cursor-pointer hover:brightness-110"
                style={{ background: getCssGradient(activeGradient) }}
                title="Share on Twitter and Facebook"
              >
                <Share2 className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Share</span>
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>

              {/* Share Dropdown popover */}
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Share Platform
                  </div>

                  {/* Share on Twitter */}
                  <button
                    onClick={handleTwitterShare}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#1DA1F2]/20 hover:text-white transition-colors text-left cursor-pointer"
                  >
                    <Twitter className="w-4 h-4 text-[#1DA1F2] fill-current" />
                    <span>Share on Twitter</span>
                  </button>

                  {/* Share on Facebook */}
                  <button
                    onClick={handleFacebookShare}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-[#1877F2]/20 hover:text-white transition-colors text-left cursor-pointer"
                  >
                    <Facebook className="w-4 h-4 text-[#1877F2] fill-current" />
                    <span>Share on Facebook</span>
                  </button>

                  <div className="my-1 border-t border-slate-700/60" />

                  <button
                    onClick={() => {
                      setShowShareMenu(false);
                      onOpenShare();
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>More share options...</span>
                  </button>
                </div>
              )}
            </div>

            {/* USER PROFILE & AUTHENTICATION BUTTONS */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="btn-navbar-profile"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 transition-all text-xs text-white cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${currentUser.avatarColor || 'from-pink-500 to-rose-600'} text-white font-bold text-[11px] flex items-center justify-center shrink-0 ring-1 ring-white/20`}
                  >
                    {currentUser.initials || currentUser.fullName?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="font-bold text-white text-xs leading-none">
                      {currentUser.fullName?.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      @{currentUser.username}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 opacity-80 hidden sm:inline" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                    {/* User header with role */}
                    <div className="p-2.5 bg-slate-750 rounded-xl mb-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-sm">{currentUser.fullName}</div>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                            isAdmin
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {isAdmin ? 'Admin' : 'Normal User'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">@{currentUser.username} • {currentUser.email}</div>
                      <div className="text-[10px] font-mono text-[#ff0084] mt-1 font-semibold">
                        {currentUser.role || (isAdmin ? 'System Administrator' : 'Standard User')}
                      </div>

                    </div>

                    {currentUser && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveTab('dashboard');
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-slate-700 text-slate-200 font-medium transition-colors text-left"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#ff0084]" />
                        <span>{isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</span>
                        {userUrlsCount > 0 && (
                          <span className="ml-auto px-1.5 py-0.5 rounded-full bg-slate-700 text-white text-[10px] font-mono">
                            {userUrlsCount}
                          </span>
                        )}
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-700/60" />

                    {/* Switch to demo user */}
                    <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                      <span>Demo Accounts</span>
                      <span className="text-[9px] text-slate-500">Normal vs Admin</span>
                    </div>
                    {DEMO_ACCOUNTS.map((u) => {
                      const userIsAdmin = isUserAdmin(u);
                      return (
                        <button
                          key={u.id}
                          onClick={async () => {
                            const nextUser = await authService.switchUser(u.username);
                            if (onUserChange) onUserChange(nextUser);
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] transition-colors ${
                            currentUser.username === u.username
                              ? 'bg-[#ff0084]/20 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <span>{u.fullName}</span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                                userIsAdmin
                                  ? 'bg-purple-900/60 text-purple-300 border border-purple-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {userIsAdmin ? 'Admin' : 'Normal'}
                            </span>
                          </div>
                          <span className="text-slate-400 text-[10px]">@{u.username}</span>
                        </button>
                      );
                    })}

                    <div className="my-1 border-t border-slate-700/60" />

                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        await authService.logout();
                        if (onUserChange) onUserChange(null);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-rose-900/30 text-rose-400 font-medium transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  id="btn-navbar-login"
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  id="btn-navbar-register"
                  onClick={() => onOpenAuth('register')}
                  className="px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #ff6b6b 0%, #e83e8c 50%, #7928ca 100%)',
                  }}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar pb-2 pt-1 border-t border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-white shadow-md font-semibold'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
                style={isActive ? { background: getCssGradient(activeGradient) } : {}}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/70'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
