import React, { useEffect, useState } from 'react';
import { authService, DEMO_ACCOUNTS } from '../utils/authService';
import {
  User,
  Lock,
  Mail,
  AtSign,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export const AuthModal = ({
  isOpen,
  onClose,
  initialMode = 'login', // 'login' | 'register'
  onSuccess,
}) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState('details'); // 'details' | 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [devCode, setDevCode] = useState('');

  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetRegisterFlow = () => {
    setRegisterStep('details');
    setOtpCode('');
    setPendingEmail('');
    setDevCode('');
  };

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(false);
    resetRegisterFlow();
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const user = await authService.login(usernameOrEmail, password);
      setSuccessMsg(`Welcome back, ${user.fullName}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(user);
        onClose();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const result = await authService.startRegister(registerForm);
      setPendingEmail(result.email || registerForm.email);
      setDevCode(result.devCode || '');
      setRegisterStep('otp');
      setSuccessMsg(result.message || `A 6-digit code was sent to ${registerForm.email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const user = await authService.verifyRegister(pendingEmail, otpCode);
      setSuccessMsg(`Email verified. Welcome, ${user.fullName}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(user);
        onClose();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const result = await authService.startRegister(registerForm);
      setDevCode(result.devCode || '');
      setSuccessMsg(result.message || 'A new verification code was sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoUser) => {
    setError(null);
    try {
      const user = await authService.switchUser(demoUser.username);
      setSuccessMsg(`Logged in as ${user.fullName}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(user);
        onClose();
      }, 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo account is unavailable.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background Overlay with radiant gradient matching the uploaded image */}
      <div
        className="fixed inset-0 transition-opacity"
        style={{
          background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 20%, #ff2a6d 60%, #8e2de2 100%)',
          opacity: 0.94,
        }}
        onClick={onClose}
      />

      {/* Main Card Container strictly matching the uploaded image UI */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl sm:rounded-[36px] shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 border border-white/40">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* LEFT SIDE: Liquid droplet organic gradient shapes strictly matching the image */}
          <div className="hidden md:block md:col-span-5 relative bg-white overflow-hidden p-6 select-none border-r border-slate-100">
            {/* Liquid Blobs rendered with high-fidelity SVG paths */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Main liquid gradient: pink to deep purple */}
                <linearGradient id="mainBlobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff416c" />
                  <stop offset="50%" stopColor="#d63384" />
                  <stop offset="100%" stopColor="#7928ca" />
                </linearGradient>

                {/* Top blob gradient: magenta to purple */}
                <linearGradient id="topBlobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4b8b" />
                  <stop offset="100%" stopColor="#8a2387" />
                </linearGradient>

                {/* Bottom peach/coral blob gradient */}
                <linearGradient id="peachBlobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffb199" />
                  <stop offset="50%" stopColor="#ff758c" />
                  <stop offset="100%" stopColor="#ff5252" />
                </linearGradient>

                {/* Bottom left purple blob */}
                <linearGradient id="bottomLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff416c" />
                  <stop offset="100%" stopColor="#8a2387" />
                </linearGradient>
              </defs>

              {/* 1. Top left blob entering from top-left */}
              <path
                d="M-40,-30 C40,-20 180,40 180,140 C180,210 100,200 40,200 C-30,200 -80,120 -80,50 Z"
                fill="url(#topBlobGrad)"
                opacity="0.95"
              />

              {/* 2. Soft translucent lavender halo border around main droplet */}
              <path
                d="M-30,120 C70,120 170,220 170,330 C170,440 80,480 -30,480 C-100,480 -130,400 -130,300 C-130,200 -90,120 -30,120 Z"
                fill="#f1dbed"
                opacity="0.85"
                transform="translate(40, 20) scale(1.15)"
              />

              {/* 3. Central large organic droplet strictly matching image */}
              <path
                d="M-30,140 C70,140 160,230 160,340 C160,430 70,470 -30,470 C-90,470 -120,400 -120,300 C-120,200 -80,140 -30,140 Z"
                fill="url(#mainBlobGrad)"
              />

              {/* 4. Bottom peach-orange organic droplet */}
              <path
                d="M110,410 C180,410 230,450 230,520 C230,590 150,620 90,620 C20,620 -10,560 20,490 C50,430 80,410 110,410 Z"
                fill="url(#peachBlobGrad)"
                opacity="0.95"
              />

              {/* 5. Bottom left magenta droplet */}
              <path
                d="M-60,420 C-10,420 50,470 50,540 C50,610 -20,630 -70,630 C-130,630 -160,570 -160,500 C-160,440 -110,420 -60,420 Z"
                fill="url(#bottomLeftGrad)"
                opacity="0.9"
              />
            </svg>

            {/* Subtle Overlay text on graphic */}
            <div className="relative z-10 h-full flex flex-col justify-end text-white pb-6 pl-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wide w-fit text-white mb-2 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>ShortScale Auth</span>
              </div>
              <p className="text-white/90 text-xs font-medium max-w-[200px] leading-relaxed drop-shadow-sm">
                Secure access to URL shortener telemetry, custom aliases & dashboard.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Login / Register Form */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {mode === 'login'
                  ? 'User Login'
                  : mode === 'register'
                    ? registerStep === 'otp'
                      ? 'Verify Email'
                      : 'Create Account'
                    : 'Reset Password'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login'
                  ? 'Access your saved short URLs, custom aliases & telemetry'
                  : mode === 'register'
                  ? registerStep === 'otp'
                    ? `Enter the 6-digit code sent to ${pendingEmail}`
                    : 'Create an account with your name, username, email, and password'
                  : 'Enter your username or email to recover access'}
              </p>
            </div>

            {/* Error & Success Toasts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-emerald-700 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ================= LOGIN FORM ================= */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto w-full">
                {/* Username Input with icon inside gray container */}
                <div className="relative flex items-center bg-[#f1f3f5] hover:bg-[#ebedef] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e83e8c]/50 rounded-xl px-4 py-3 transition-all border border-transparent focus-within:border-[#e83e8c]/40">
                  <User className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                  <input
                    id="input-login-username"
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Username or Email"
                    required
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                  />
                </div>

                {/* Password Input with icon inside gray container */}
                <div className="relative flex items-center bg-[#f1f3f5] hover:bg-[#ebedef] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e83e8c]/50 rounded-xl px-4 py-3 transition-all border border-transparent focus-within:border-[#e83e8c]/40">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Gradient Pill LOGIN Button strictly matching image */}
                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-3.5 px-6 rounded-full text-white font-extrabold text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #ff6b6b 0%, #e83e8c 50%, #7928ca 100%)',
                  }}
                >
                  {isSubmitting ? 'Signing in...' : 'LOGIN'}
                </button>

                {/* Sub-link 1: Forgot Username Password? */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    Forgot Username Password?
                  </button>
                </div>

                {/* Sub-link 2: Create Your Account -> */}
                <div className="text-center pt-3 border-t border-slate-100">
                  <button
                    id="btn-switch-to-register"
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMsg(null);
                      resetRegisterFlow();
                      setMode('register');
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group"
                  >
                    <span>Create Your Account</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* 1-Click Demo Accounts Quick Access */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center mb-2">
                    Or 1-Click Quick Demo Sign In
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_ACCOUNTS.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickLogin(u)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center transition-all cursor-pointer text-xs"
                      >
                        <div className="font-bold text-slate-800 text-[11px] truncate">{u.fullName.split(' ')[0]}</div>
                        <div className="text-[9px] text-slate-400 truncate">@{u.username}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {/* ================= REGISTER FORM ================= */}
            {mode === 'register' && registerStep === 'details' && (
              <form onSubmit={handleRegister} className="space-y-3 max-w-md mx-auto w-full text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-center bg-[#f1f3f5] hover:bg-[#ebedef] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e83e8c]/50 rounded-xl px-3 py-2.5 transition-all border border-transparent">
                    <User className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                    <input
                      id="reg-fullname"
                      type="text"
                      placeholder="Full Name *"
                      required
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                      className="w-full bg-transparent text-slate-800 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="flex items-center bg-[#f1f3f5] hover:bg-[#ebedef] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e83e8c]/50 rounded-xl px-3 py-2.5 transition-all border border-transparent">
                    <AtSign className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                    <input
                      id="reg-username"
                      type="text"
                      placeholder="Username *"
                      required
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      className="w-full bg-transparent text-slate-800 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center bg-[#f1f3f5] hover:bg-[#ebedef] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e83e8c]/50 rounded-xl px-3 py-2.5 transition-all border border-transparent">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="Email Address *"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full bg-transparent text-slate-800 focus:outline-none font-medium"
                  />
                </div>

                <div className="flex items-center bg-[#f1f3f5] hover:bg-[#ebedef] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e83e8c]/50 rounded-xl px-3 py-2.5 transition-all border border-transparent">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (min 6 characters) *"
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full bg-transparent text-slate-800 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full text-white font-extrabold text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all mt-2 cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #ff6b6b 0%, #e83e8c 50%, #7928ca 100%)',
                  }}
                >
                  {isSubmitting ? 'Sending Code...' : 'Send Verification Code'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMsg(null);
                      resetRegisterFlow();
                      setMode('login');
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Already have an account? <span className="font-bold text-[#e83e8c]">Sign In →</span>
                  </button>
                </div>
              </form>
            )}

            {mode === 'register' && registerStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-3 max-w-md mx-auto w-full text-xs">
                {devCode && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                    Local email is not configured. Use this code: <span className="font-bold tracking-widest">{devCode}</span>
                  </div>
                )}

                <div className="flex items-center bg-[#f1f3f5] hover:bg-[#ebedef] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e83e8c]/50 rounded-xl px-3 py-2.5 transition-all border border-transparent">
                  <KeyRound className="w-4 h-4 text-slate-500 shrink-0 mr-2" />
                  <input
                    id="reg-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="6-digit code"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-transparent text-slate-800 focus:outline-none font-medium tracking-[0.35em]"
                  />
                </div>

                <button
                  id="btn-verify-register"
                  type="submit"
                  disabled={isSubmitting || otpCode.length !== 6}
                  className="w-full py-3 rounded-full text-white font-extrabold text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(to right, #ff6b6b 0%, #e83e8c 50%, #7928ca 100%)',
                  }}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Create Account'}
                </button>

                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleResendOtp}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setError(null);
                      setSuccessMsg(null);
                      setOtpCode('');
                      setDevCode('');
                      setRegisterStep('details');
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Change email
                  </button>
                </div>
              </form>
            )}

            {/* ================= FORGOT PASSWORD ================= */}
            {mode === 'forgot' && (
              <div className="space-y-4 max-w-sm mx-auto w-full text-center">
                <p className="text-xs text-slate-600">
                  This demo stores accounts in your browser only. Use a one-click demo account, or
                  sign in with the account you registered.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => handleQuickLogin(account)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs"
                    >
                      <div className="font-bold text-slate-800">{account.fullName}</div>
                      <div className="text-slate-500">@{account.username}</div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
