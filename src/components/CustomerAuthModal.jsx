import React, { useState } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import logoVaagai from '../assests/images/Logo-Vaagai.jpeg';

export function CustomerAuthModal({ isOpen, onClose, onSuccess, initialTab = 'login' }) {
  const { login, register } = useCustomerAuth();
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (res.success) {
          if (onSuccess) onSuccess(res.user);
          onClose();
        } else {
          setError(res.message || 'Invalid email or password.');
        }
      } else {
        const res = await register(name, email, password, phone);
        if (res.success) {
          setSuccessMsg('Account created successfully! Welcome to Vaagai.');
          if (onSuccess) onSuccess(res.user);
          setTimeout(() => onClose(), 1000);
        } else {
          setError(res.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickPreset = () => {
    setEmail('priya.s@example.com');
    setPassword('Priya@2026');
    setTab('login');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#29201E] border border-[#C9A43B]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-[#F5EEE5] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#E9D9BF]/60 hover:text-[#C9A43B] text-sm p-1.5 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* VAAGAI Emblem & Header */}
        <div className="text-center mb-6">
          <img
            src={logoVaagai}
            alt="VAAGAI"
            className="w-12 h-12 rounded-full mx-auto object-cover border border-[#C9A43B]/40 shadow-md mb-2"
          />
          <h2 className="font-serif text-2xl font-bold tracking-wide text-[#E9D9BF]">
            VAAGAI PATRON
          </h2>
          <p className="text-xs text-[#E9D9BF]/70 mt-1">
            {tab === 'login' ? 'Sign in to access your orders and drapes' : 'Create an atelier patron profile'}
          </p>
        </div>

        {/* Tabs: Sign In / Create Account */}
        <div className="flex border-b border-[#C9A43B]/20 mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 pb-3 text-xs uppercase tracking-widest font-semibold transition-colors ${
              tab === 'login'
                ? 'text-[#C9A43B] border-b-2 border-[#C9A43B]'
                : 'text-[#E9D9BF]/50 hover:text-[#E9D9BF]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 pb-3 text-xs uppercase tracking-widest font-semibold transition-colors ${
              tab === 'register'
                ? 'text-[#C9A43B] border-b-2 border-[#C9A43B]'
                : 'text-[#E9D9BF]/50 hover:text-[#E9D9BF]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick-fill preset chip for testing */}
        {tab === 'login' && (
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={fillQuickPreset}
              className="text-[11px] text-[#C9A43B] bg-[#C9A43B]/10 hover:bg-[#C9A43B]/20 border border-[#C9A43B]/30 px-3 py-1 rounded-full transition-colors"
            >
              ✦ Quick-fill Patron: priya.s@example.com
            </button>
          </div>
        )}

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-[#720F25]/40 border border-[#C34444] rounded-xl text-xs text-[#FFCDD2] flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-[#287A52]/30 border border-[#287A52] rounded-xl text-xs text-[#C8E6C9] flex items-center gap-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#C9A43B] font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sundararajan"
                  className="w-full px-3.5 py-2.5 text-xs bg-black/40 border border-[#C9A43B]/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C9A43B]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#C9A43B] font-semibold mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98401 00000"
                  className="w-full px-3.5 py-2.5 text-xs bg-black/40 border border-[#C9A43B]/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C9A43B]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#C9A43B] font-semibold mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patron@example.com"
              className="w-full px-3.5 py-2.5 text-xs bg-black/40 border border-[#C9A43B]/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C9A43B]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] uppercase tracking-wider text-[#C9A43B] font-semibold">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-[#C9A43B]/70 hover:text-[#C9A43B]"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-xs bg-black/40 border border-[#C9A43B]/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C9A43B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-[#C9A43B] to-[#B9953B] hover:from-[#B9953B] hover:to-[#A37F2C] text-[#29201E] text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : tab === 'login' ? 'Sign In to Atelier' : 'Create Patron Account'}
          </button>
        </form>

        <p className="text-center text-[10px] text-[#E9D9BF]/50 mt-6">
          Complimentary insured shipping & heirloom curation for all registered patrons.
        </p>
      </div>
    </div>
  );
}

