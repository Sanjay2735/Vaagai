import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../adminApi';
import logoVaagai from '../../assests/images/Logo-Vaagai.jpeg';

export function AdminLogin({ onSuccess }) {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('admin@vaagai.com');
  const [password, setPassword] = useState('Admin@Vaagai2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Countdown timer for security lockout
  useEffect(() => {
    let timer;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setError('');
    setLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      setLoading(false);

      if (res.success) {
        window.location.hash = '#admin/dashboard';
        if (onSuccess) onSuccess();
      } else {
        if (res.lockoutSeconds) {
          setLockoutSeconds(res.lockoutSeconds);
        }
        setError(res.message || 'Invalid administrator credentials or unauthorized role.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await adminApi.forgotPassword(forgotEmail);
      if (res.success) {
        setForgotMsg(res.message);
        if (res.resetCode) {
          setResetCode(res.resetCode);
        }
      } else {
        setForgotMsg(res.message || 'Unable to request password reset.');
      }
    } catch (err) {
      setForgotMsg(err.message || 'Reset request failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setResetSuccess('');
    try {
      const res = await adminApi.resetPassword(resetCode, newPassword);
      if (res.success) {
        setResetSuccess(res.message);
        setPassword(newPassword);
        setTimeout(() => {
          setForgotModalOpen(false);
          setResetSuccess('');
          setForgotMsg('');
        }, 2000);
      } else {
        setForgotMsg(res.message || 'Password reset failed.');
      }
    } catch (err) {
      setForgotMsg(err.message || 'Reset failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F1] flex flex-col lg:flex-row font-sans selection:bg-[#B9953B] selection:text-[#4A0715]">
      {/* ========================================================
          LEFT SECTION: CINEMATIC EDITORIAL BRAND SANCTUARY
          ======================================================== */}
      <div className="lg:w-1/2 relative min-h-[320px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden bg-[#4A0715]">
        {/* Background Editorial Image with Luxury Blend */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg"
            alt="VAAGAI Saree Editorial"
            className="w-full h-full object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out opacity-45 mix-blend-overlay"
          />
          {/* Dual Radial Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#29201E] via-[#4A0715]/80 to-[#720F25]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-[#4A0715]/40 to-[#1A0307]/90" />
        </div>

        {/* Top Header: Brand Emblem & Tagline */}
        <div className="relative z-10 flex items-center space-x-3.5">
          <div className="p-1 rounded-full bg-white/10 backdrop-blur-md border border-[#C9A43B]/60 shadow-lg">
            <img
              src={logoVaagai}
              alt="VAAGAI Emblem"
              className="w-11 h-11 rounded-full object-cover"
            />
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.25em] text-[#F5EEE5] uppercase block leading-none">
              VAAGAI
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A43B] font-semibold mt-0.5 block">
              South Indian Saree Atelier
            </span>
          </div>
        </div>

        {/* Center: Brand Manifesto Quote */}
        <div className="relative z-10 my-auto py-8 lg:py-12 max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#C9A43B]/15 border border-[#C9A43B]/30 backdrop-blur-md mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A43B] animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-[#E9D9BF] font-bold">
              Protected Administrative Core
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F5EEE5] leading-[1.15] tracking-wide">
            Where Heritage Meets <br />
            <span className="italic font-light text-[#C9A43B]">Modern Elegance.</span>
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-[#E9D9BF]/80 font-light leading-relaxed max-w-md">
            Dedicated enterprise administration system managing Kanjivaram silk inventories,
            artisan loom commissions, and white-glove patron fulfillment across the globe.
          </p>

          <div className="mt-6 pt-6 border-t border-[#C9A43B]/20 flex items-center space-x-6 text-[11px] text-[#E9D9BF]/70 font-mono">
            <span>✦ Pure Zari Weaves</span>
            <span>✦ Pen Kalamkari</span>
            <span>✦ Temple Silk Certified</span>
          </div>
        </div>

        {/* Bottom Footer: Security Notice */}
        <div className="relative z-10 text-[11px] text-[#E9D9BF]/60 flex items-center justify-between border-t border-white/10 pt-4">
          <span>Security Protocol 256-Bit TLS</span>
          <span>Chennai Flagship Atelier</span>
        </div>
      </div>

      {/* ========================================================
          RIGHT SECTION: SOPHISTICATED AUTHENTICATION INTERFACE
          ======================================================== */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-[#F7F5F1]">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#4A0715]/10 border border-[#4A0715]/20 text-[#4A0715] text-[10px] font-bold uppercase tracking-widest mb-3">
              <span>VAAGAI ADMINISTRATION</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#29201E] tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs text-[#81766E] mt-1">
              Please authenticate with your verified administrative credentials.
            </p>
          </div>

          {/* Authentication Form Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-[#E8E2D9]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-xl bg-[#FDE8E8] border border-[#F8B4B4] text-[#C34444] text-xs flex items-start space-x-2.5 animate-fadeIn">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Rate Limit Lockout Banner */}
              {lockoutSeconds > 0 && (
                <div className="p-3 rounded-xl bg-[#FFF8E1] border border-[#FFE082] text-[#C58A28] text-xs flex items-center space-x-2 animate-fadeIn font-medium">
                  <span>⏱️ Rate limit active: retry in {lockoutSeconds} seconds.</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-[11px] font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                  Administrator Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vaagai.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-xl text-[#29201E] focus:outline-none focus:border-[#B9953B] focus:bg-white transition-all font-medium"
                  />
                  <svg className="w-4 h-4 text-[#81766E] absolute left-3 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-[#29201E] uppercase tracking-wider">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] text-[#B9953B] hover:text-[#4A0715] font-semibold transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-xl text-[#29201E] focus:outline-none focus:border-[#B9953B] focus:bg-white transition-all font-medium"
                  />
                  <svg className="w-4 h-4 text-[#81766E] absolute left-3 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#81766E] hover:text-[#4A0715] focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#E8E2D9] text-[#4A0715] focus:ring-0"
                  />
                  <span className="text-[#70594B] font-medium">Remember session securely</span>
                </label>
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || lockoutSeconds > 0}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-md text-xs font-semibold uppercase tracking-widest text-[#F5EEE5] bg-[#4A0715] hover:bg-[#720F25] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-[#C9A43B] border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Privilege...</span>
                    </div>
                  ) : (
                    <span>Sign In to Administration</span>
                  )}
                </button>
              </div>
            </form>

            {/* Quick-Fill Presets for Evaluation */}
            <div className="mt-6 pt-5 border-t border-[#F0EBE1]">
              <p className="text-[10px] font-semibold text-[#81766E] uppercase tracking-wider mb-2 text-center">
                Quick Role Credentials for Testing
              </p>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@vaagai.com', 'Admin@Vaagai2026!')}
                  className="p-2 rounded-xl border border-[#E8E2D9] bg-[#F7F5F1] hover:bg-[#F5EEE5] text-[#4A0715] font-semibold transition-colors text-center"
                >
                  <span className="block font-bold">Super Admin</span>
                  <span className="text-[9px] text-[#81766E]">Full System</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('curator@vaagai.com', 'Curator@2026')}
                  className="p-2 rounded-xl border border-[#E8E2D9] bg-[#F7F5F1] hover:bg-[#F5EEE5] text-[#4A0715] font-semibold transition-colors text-center"
                >
                  <span className="block font-bold">Curator</span>
                  <span className="text-[9px] text-[#81766E]">Products/Stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('orders@vaagai.com', 'Orders@2026')}
                  className="p-2 rounded-xl border border-[#E8E2D9] bg-[#F7F5F1] hover:bg-[#F5EEE5] text-[#4A0715] font-semibold transition-colors text-center"
                >
                  <span className="block font-bold">Fulfillment</span>
                  <span className="text-[9px] text-[#81766E]">Orders/Ship</span>
                </button>
              </div>
            </div>
          </div>

          {/* Return to Storefront link */}
          <div className="text-center pt-2">
            <a
              href="#home"
              className="text-xs text-[#81766E] hover:text-[#4A0715] font-medium transition-colors inline-flex items-center space-x-1.5"
            >
              <span>← Return to VAAGAI Boutique Storefront</span>
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================
          FORGOT / RESET PASSWORD MODAL
          ======================================================== */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
              <h3 className="font-serif text-base font-bold text-[#4A0715]">
                Reset Administrator Access
              </h3>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="text-[#81766E] hover:text-[#29201E]"
              >
                ✕
              </button>
            </div>

            {forgotMsg && (
              <div className="p-3 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] text-[#287A52]">
                {forgotMsg}
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] text-[#287A52] font-bold">
                ✓ {resetSuccess}
              </div>
            )}

            {!resetCode ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-[#81766E]">
                  Enter your administrative email to receive a secure password reset authorization code.
                </p>
                <div>
                  <label className="block font-semibold text-[#29201E] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@vaagai.com"
                    className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3 py-1.5 text-[#81766E]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-1.5 bg-[#4A0715] text-[#F5EEE5] font-semibold rounded-lg hover:bg-[#720F25] disabled:opacity-50"
                  >
                    {forgotLoading ? 'Generating...' : 'Request Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block font-semibold text-[#29201E] mb-1">Reset Authorization Code</label>
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                    placeholder="VAG-123456"
                    className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg font-mono font-bold text-[#4A0715] focus:outline-none focus:border-[#B9953B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#29201E] mb-1">New Secure Password (min 8 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3 py-1.5 text-[#81766E]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-1.5 bg-[#287A52] text-white font-semibold rounded-lg hover:bg-[#206342] disabled:opacity-50"
                  >
                    {forgotLoading ? 'Resetting...' : 'Confirm New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
