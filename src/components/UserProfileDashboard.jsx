import React, { useState } from 'react';
import { authService, DEMO_ACCOUNTS } from '../utils/authService';
import { createShortUrl, deleteShortUrl, resolveShortUrl, toggleUrlCache } from '../utils/urlApi';
import { getPublicShortOrigin } from '../utils/apiClient';
import { getCssGradient } from '../utils/gradients';
import { copyToClipboard } from '../utils/clipboard';
import {
  User,
  Mail,
  Briefcase,
  Building,
  Calendar,
  ShieldCheck,
  Link2,
  ExternalLink,
  Copy,
  Check,
  Zap,
  BarChart3,
  Clock,
  Trash2,
  Share2,
  Search,
  PlusCircle,
  Edit3,
  LogOut,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  Globe,
  QrCode,
  RotateCcw,
} from 'lucide-react';

export const UserProfileDashboard = ({
  currentUser,
  onUpdateUser,
  onOpenAuth,
  urls,
  onRefreshUrls,
  onSelectTrace,
  onOpenAnalytics,
  onOpenShare,
  activeGradient,
  shortDomain = 'sho.rt',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, expired, cached
  const [copiedId, setCopiedId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.fullName || '',
    role: currentUser?.role || '',
    organization: currentUser?.organization || '',
    bio: currentUser?.bio || '',
  });

  // Quick URL Shorten inside dashboard
  const [showQuickShorten, setShowQuickShorten] = useState(false);
  const [quickUrl, setQuickUrl] = useState('');
  const [quickAlias, setQuickAlias] = useState('');
  const [quickExpiration, setQuickExpiration] = useState('never');
  const [quickError, setQuickError] = useState(null);
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);
  const [redirectToast, setRedirectToast] = useState(null);

  const primaryFrom = activeGradient?.from || '#ff0084';
  const primaryTo = activeGradient?.to || '#33001b';

  // Filter URLs created by this user
  const userUrls = urls.filter((u) => {
    if (!currentUser) return false;
    return (
      (u.createdBy && u.createdBy.toLowerCase() === currentUser.username.toLowerCase()) ||
      (currentUser.username === 'system-admin' && (u.createdBy === 'system-admin' || !u.createdBy))
    );
  });

  // Filtered list
  const now = Date.now();
  const filteredUrls = userUrls.filter((u) => {
    const matchesSearch =
      u.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.originalUrl.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isExpired = u.expirationTime && u.expirationTime < now;
    if (filterStatus === 'active') return !isExpired;
    if (filterStatus === 'expired') return isExpired;
    if (filterStatus === 'cached') return u.cached;
    return true;
  });

  // Aggregated stats
  const totalUserUrls = userUrls.length;
  const totalUserClicks = userUrls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const activeUserUrls = userUrls.filter((u) => !u.expirationTime || u.expirationTime >= now).length;
  const cachedUserUrls = userUrls.filter((u) => u.cached).length;
  const cacheRate = totalUserUrls > 0 ? Math.round((cachedUserUrls / totalUserUrls) * 100) : 0;
  const topUrl = [...userUrls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];

  const handleCopy = async (text, id) => {
    const ok = await copyToClipboard(text);
    if (!ok) return;
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestRedirect = async (shortCode) => {
    const res = await resolveShortUrl(shortCode);
    if (onSelectTrace) onSelectTrace(res.trace);
    onRefreshUrls();

    setRedirectToast({
      shortCode,
      targetUrl: res.originalUrl || 'Not Found',
      cacheHit: res.cacheHit,
      latencyMs: res.latencyMs,
      expired: res.expired,
    });

    setTimeout(() => {
      setRedirectToast(null);
    }, 5000);
  };

  const handleToggleCache = async (code) => {
    await toggleUrlCache(code);
    onRefreshUrls();
  };

  const handleDeleteUrl = async (id) => {
    if (window.confirm('Are you sure you want to delete this shortened URL?')) {
      await deleteShortUrl(id);
      onRefreshUrls();
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await authService.updateProfile(profileForm);
      onUpdateUser(updated);
      setIsEditingProfile(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickShorten = async (e) => {
    e.preventDefault();
    setQuickError(null);
    if (!quickUrl.trim()) {
      setQuickError('Please enter a destination URL.');
      return;
    }

    let expTime = null;
    if (quickExpiration === '24h') expTime = Date.now() + 24 * 60 * 60 * 1000;
    if (quickExpiration === '7d') expTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    if (quickExpiration === '30d') expTime = Date.now() + 30 * 24 * 60 * 60 * 1000;

    setIsQuickSubmitting(true);
    try {
      const { trace } = await createShortUrl({
        originalUrl: quickUrl,
        customAlias: quickAlias.trim() || null,
        expirationTime: expTime,
      });

      if (onSelectTrace) onSelectTrace(trace);
      setQuickUrl('');
      setQuickAlias('');
      setShowQuickShorten(false);
      onRefreshUrls();
    } catch (err) {
      setQuickError(err instanceof Error ? err.message : 'Error creating short URL');
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 space-y-6">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg"
            style={{ background: getCssGradient(activeGradient) }}
          >
            <User className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              User Profile & Saved URLs Dashboard
            </h2>
              <p className="text-sm text-white/70 leading-relaxed">
              Sign in to manage your personal shortened URLs, monitor click stats, set custom aliases, and manage your account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-6 py-3 rounded-full text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #ff6b6b 0%, #e83e8c 50%, #7928ca 100%)',
              }}
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all cursor-pointer"
            >
              Register with More Details
            </button>
          </div>

          {/* Quick Demo Switcher */}
          <div className="pt-6 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Or instantly explore with a demo user:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {DEMO_ACCOUNTS.map((u) => (
                <button
                  key={u.id}
                  onClick={async () => {
                    const nextUser = await authService.switchUser(u.username);
                    onUpdateUser(nextUser);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium flex items-center space-x-1.5 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{u.fullName} (@{u.username})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Toast for Redirect Test */}
      {redirectToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-start space-x-3 max-w-md animate-in slide-in-from-bottom-5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl mt-0.5">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs space-y-1">
            <div className="font-bold flex items-center space-x-1.5 text-slate-200">
              <span>{redirectToast.expired ? 'HTTP 410 Expired' : 'HTTP 302 Found Redirect'}</span>
              <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${redirectToast.cacheHit ? 'bg-amber-400/20 text-amber-300' : 'bg-blue-400/20 text-blue-300'}`}>
                {redirectToast.cacheHit ? 'Redis Cache HIT' : 'PostgreSQL MISS'}
              </span>
            </div>
            <p className="text-slate-400 break-all truncate">
              /{redirectToast.shortCode} → {redirectToast.targetUrl}
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              Latency: <span className="text-emerald-400 font-bold">{redirectToast.latencyMs}ms</span>
            </div>
          </div>
          <button onClick={() => setRedirectToast(null)} className="text-slate-400 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        {/* Banner with system gradient */}
        <div
          className="h-28 sm:h-32 w-full relative"
          style={{ background: getCssGradient(activeGradient) }}
        >
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-white text-xs font-semibold shadow-xs flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{currentUser.plan || 'Enterprise Pro'}</span>
            </span>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            {/* Avatar & Basic Info */}
            <div className="flex items-end space-x-4">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr ${currentUser.avatarColor || 'from-pink-500 to-rose-600'} text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center ring-4 ring-white shadow-lg shrink-0`}
              >
                {currentUser.initials || currentUser.fullName?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {currentUser.fullName}
                  </h1>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    @{currentUser.username}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center space-x-2 flex-wrap">
                  <span>{currentUser.role || 'System Engineer'}</span>
                  <span className="text-slate-300">•</span>
                  <span>{currentUser.organization || 'Independent'}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 self-start sm:self-end pt-2 sm:pt-0">
              <button
                id="btn-edit-profile"
                onClick={() => {
                  setProfileForm({
                    fullName: currentUser.fullName || '',
                    role: currentUser.role || '',
                    organization: currentUser.organization || '',
                    bio: currentUser.bio || '',
                  });
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>

              <button
                id="btn-user-signout"
                onClick={async () => {
                  await authService.logout();
                  onUpdateUser(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Profile Bio */}
          {currentUser.bio && (
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              {currentUser.bio}
            </p>
          )}

          {/* Meta line */}
          <div className="flex items-center space-x-4 sm:space-x-6 text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100 flex-wrap gap-y-2">
            <div className="flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600 font-medium">{currentUser.email}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Joined {currentUser.joinedDate || 'Recently'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Custom Domain: <strong className="text-slate-700">{shortDomain}</strong></span>
            </div>
          </div>

          {/* Inline Edit Form */}
          {isEditingProfile && (
            <form onSubmit={handleSaveProfile} className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-4 animate-in fade-in">
              <div className="font-bold text-slate-800 text-sm">Edit Profile Information</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#ff0084]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Role / Title</label>
                  <input
                    type="text"
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#ff0084]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 font-medium">Organization</label>
                  <input
                    type="text"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#ff0084]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">Bio</label>
                <textarea
                  rows={2}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3 py-2 glass-input rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#ff0084]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white font-bold"
                  style={{ background: getCssGradient(activeGradient) }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* User Dashboard Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Links */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>My Short URLs</span>
            <div className="p-2 rounded-xl bg-pink-50 text-[#ff0084]">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {totalUserUrls}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <span className="text-emerald-600 font-bold">{activeUserUrls} active</span>
            <span>•</span>
            <span>{totalUserUrls - activeUserUrls} expired</span>
          </div>
        </div>

        {/* Card 2: Total Clicks */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Clicks Tracked</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {totalUserClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            Across all {totalUserUrls} links via 302 redirects
          </div>
        </div>

        {/* Card 3: Cache Hit Rate */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>In-Memory Redis Cache</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {cacheRate}%
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            {cachedUserUrls} hot in RAM (&lt; 10ms SLA)
          </div>
        </div>

        {/* Card 4: Top Performing Link */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Top Performing Code</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono truncate">
            {topUrl ? `/${topUrl.shortCode}` : 'None yet'}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {topUrl ? `${topUrl.clicks} clicks (${topUrl.originalUrl.replace(/^https?:\/\//, '').slice(0, 22)}...)` : 'Shorten a URL to track'}
          </div>
        </div>
      </div>

      {/* Quick Shorten in Dashboard Toggle & Panel */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-xl text-white"
              style={{ background: getCssGradient(activeGradient) }}
            >
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Shorten a URL for My Profile
              </h3>
              <p className="text-xs text-slate-500">
                Newly created links are automatically attributed to @{currentUser.username} and saved to your dashboard.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowQuickShorten(!showQuickShorten)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            {showQuickShorten ? 'Hide Form' : '+ Quick Shorten'}
          </button>
        </div>

        {showQuickShorten && (
          <form onSubmit={handleQuickShorten} className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in text-xs">
            {quickError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {quickError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 space-y-1">
                <label className="font-semibold text-slate-700">Destination Long URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/my-article-or-service"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff0084]"
                />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-slate-700">Custom Alias (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. my-project"
                  value={quickAlias}
                  onChange={(e) => setQuickAlias(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff0084]"
                />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-slate-700">Expiration</label>
                <select
                  value={quickExpiration}
                  onChange={(e) => setQuickExpiration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff0084]"
                >
                  <option value="never">Never Expires (Permanent)</option>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isQuickSubmitting}
                className="px-5 py-2.5 rounded-full text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #ff6b6b 0%, #e83e8c 50%, #7928ca 100%)',
                }}
              >
                {isQuickSubmitting ? 'Shortening...' : 'Generate Short Link for @' + currentUser.username}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* User Shortened URLs Management Section */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        {/* Header & Filter Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Saved Short URLs & Telemetry ({filteredUrls.length} / {totalUserUrls})
            </h2>
            <p className="text-xs text-slate-500">
              All shortened links associated with @{currentUser.username} in the distributed registry
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search my URLs or codes..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#ff0084]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 w-full sm:w-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'expired', label: 'Expired' },
                { id: 'cached', label: 'In Cache' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterStatus === f.id ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* URLs Table / Cards */}
        {filteredUrls.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Link2 className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
            <div className="font-semibold text-slate-700 text-sm">No URLs Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {totalUserUrls === 0
                ? "You haven't generated any short URLs under this profile yet. Use the Quick Shorten tool above to create one!"
                : "No URLs match the current search query or filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredUrls.map((url) => {
              const isExpired = url.expirationTime && url.expirationTime < now;
              const fullShortUrl = `${getPublicShortOrigin()}/${url.shortCode}`;

              return (
                <div
                  key={url.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: URL info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {/* Short Link Badge */}
                      <a
                        href={url.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono font-bold text-sm hover:underline flex items-center space-x-1"
                        style={{ color: primaryFrom }}
                      >
                        <span>{fullShortUrl}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>

                      {/* Copy button */}
                      <button
                        onClick={() => handleCopy(fullShortUrl, url.id)}
                        className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Copy short URL"
                      >
                        {copiedId === url.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Status Badges */}
                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                          Expired (HTTP 410)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          Active 302
                        </span>
                      )}

                      {url.cached ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold flex items-center space-x-1">
                          <Zap className="w-2.5 h-2.5 text-amber-600" />
                          <span>Redis Hot</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                          DB Cold
                        </span>
                      )}

                      {url.customAlias && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono">
                          Custom Alias
                        </span>
                      )}
                    </div>

                    {/* Original Destination URL */}
                    <div className="text-xs text-slate-500 flex items-center space-x-1 truncate max-w-2xl">
                      <span className="shrink-0 font-medium text-slate-400">Target:</span>
                      <span className="truncate hover:text-slate-800 font-mono text-[11px]">{url.originalUrl}</span>
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-0.5 flex-wrap gap-y-1">
                      <span>Created {new Date(url.creationTime).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>
                        {url.expirationTime
                          ? `Expires ${new Date(url.expirationTime).toLocaleDateString()}`
                          : 'Permanent (No TTL)'}
                      </span>
                      <span>•</span>
                      <span className="font-mono">Counter ID: #{url.counterId || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Right: Clicks & Action Buttons */}
                  <div className="flex items-center space-x-2.5 shrink-0 self-start lg:self-center">
                    {/* Clicks badge */}
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-center min-w-[70px]">
                      <div className="text-xs font-mono font-bold text-white">
                        {url.clicks.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">clicks</div>
                    </div>

                    {/* Action 1: Test 302 Redirect */}
                    <button
                      onClick={() => handleTestRedirect(url.shortCode)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs transition-all cursor-pointer"
                      title="Simulate 302 redirect resolution"
                    >
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Test 302</span>
                    </button>

                    {/* Action 2: Analytics Modal */}
                    <button
                      onClick={() => onOpenAnalytics(url)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="View link analytics & Geo breakdown"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>

                    {/* Action 3: Toggle Redis Cache */}
                    <button
                      onClick={() => handleToggleCache(url.shortCode)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        url.cached
                          ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={url.cached ? 'Evict from Redis Cache' : 'Warm into Redis Cache'}
                    >
                      <Zap className="w-4 h-4" />
                    </button>

                    {/* Action 4: Share Modal */}
                    <button
                      onClick={() => onOpenShare(url)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Share link on Twitter / Facebook"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Action 5: Delete */}
                    <button
                      onClick={() => handleDeleteUrl(url.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Delete shortened link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
