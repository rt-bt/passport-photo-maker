import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  Settings,
  Mail
} from 'lucide-react';
import { APP_PLANS, PlanDuration, LicenseStatus } from '../../types/subscription';
import { activateLicense } from '../../lib/licensing';
import { AdminGeneratorModal } from './AdminGeneratorModal';

interface SubscriptionGateProps {
  onSuccess: (status: LicenseStatus) => void;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ onSuccess }) => {
  const [inputEmail, setInputEmail] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPassPrompt, setAdminPassPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const emailTrimmed = inputEmail.trim();
    const keyTrimmed = inputKey.trim();

    if (!emailTrimmed) {
      setErrorMsg('Please enter your authorized User ID (Email Address).');
      return;
    }

    if (!keyTrimmed) {
      setErrorMsg('Please enter your Client License Key.');
      return;
    }

    const res = activateLicense(keyTrimmed, emailTrimmed);
    if (res.active) {
      onSuccess(res);
    } else {
      setErrorMsg(res.error || 'Invalid or expired Client ID. Please verify your credentials.');
    }
  };

  const handleOpenAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (adminPassword === 'Admin@1.23#') {
      setAdminPassPrompt(false);
      setAdminPassword('');
      setIsAdminModalOpen(true);
    } else {
      setAdminError('Incorrect Admin Passkey.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Brand Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              TrueTone & Passport Studio Pro
            </span>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Client Subscription Access
            </div>
          </div>
        </div>

        {/* Discreet Admin Button */}
        <button
          type="button"
          onClick={() => {
            setAdminError(null);
            setAdminPassword('');
            setAdminPassPrompt(true);
          }}
          className="text-xs text-slate-400 hover:text-slate-200 py-1.5 px-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Admin Portal</span>
        </button>
      </div>

      {/* Main Activation & Plans Section */}
      <div className="max-w-5xl w-full mx-auto my-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            Protected Studio Access
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Enter Your User ID & License Key
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            This repository is subscription-protected. Enter your authorized Email ID and License Key below to unlock Passport Photo Maker, AI Studio Restoration, and Colorization.
          </p>
        </div>

        {/* License Key Activation Card */}
        <div className="max-w-xl mx-auto p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <form onSubmit={handleActivate} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                User ID (Registered Email Address)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="e.g. client@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Client License Key / Activation Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="e.g. TT-1Y-USER4F12-21147-38F9A102"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm font-mono text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase tracking-wider"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              Activate Studio Access
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Don't have an active license? Choose a subscription plan below and contact the administrator to get your User ID activated.
            </p>
          </div>
        </div>

        {/* Subscription Plans Grid */}
        <div className="space-y-4">
          <h3 className="text-center font-bold text-base text-slate-300">
            Available Subscription Tiers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(Object.keys(APP_PLANS) as PlanDuration[]).map((planKey) => {
              const plan = APP_PLANS[planKey];
              const isLife = planKey === 'lifetime';
              const isYear = planKey === '1_year';

              return (
                <div
                  key={planKey}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isLife
                      ? 'bg-gradient-to-b from-amber-500/10 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : isYear
                      ? 'bg-gradient-to-b from-blue-500/10 to-slate-900 border-blue-500/40 shadow-md shadow-blue-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {plan.code}
                      </span>
                      {isLife && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          PERPETUAL
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-white">{plan.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {plan.days === 0 ? 'Never Expires' : `${plan.days} Days Full Access`}
                    </p>
                  </div>

                  <ul className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      Passport Maker
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      AI Restoration
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      B&W Colorizer
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 pt-6 border-t border-slate-800/60">
        © 2026 TrueTone & Passport Photo Maker Pro • 100% Client-Side Privacy & In-Browser Hardware Acceleration
      </div>

      {/* Admin Password Prompt Modal */}
      {adminPassPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-slate-200">
              <Settings className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm">Admin Master Passkey</h3>
            </div>
            <form onSubmit={handleOpenAdmin} className="space-y-3">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter master passkey"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              {adminError && <p className="text-xs text-rose-400">{adminError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminPassPrompt(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer"
                >
                  Enter Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Key Generator Modal */}
      <AdminGeneratorModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
};
