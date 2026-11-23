import React from 'react';
import { Crown, Calendar, User, KeyRound, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { LicenseStatus } from '../../types/subscription';
import { Modal } from '../common/Modal';

interface SubscriptionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: LicenseStatus;
  onDeactivate: () => void;
}

export const SubscriptionStatusModal: React.FC<SubscriptionStatusModalProps> = ({
  isOpen,
  onClose,
  license,
  onDeactivate,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Active Subscription" maxWidth="md">
      <div className="space-y-5 text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-300 dark:border-amber-700/50">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {license.planTitle || 'Pro Subscription'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              All passport photo tools, AI restoration studio, and colorization features unlocked.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Client Identifier
            </span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {license.client || 'Client'}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Expiry Date
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {license.expiryDate || 'Lifetime Access'}
            </span>
          </div>

          {license.daysLeft !== null && license.daysLeft !== undefined && (
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Time Remaining
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {license.daysLeft} Day{license.daysLeft === 1 ? '' : 's'} Left
              </span>
            </div>
          )}

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-slate-400" /> Active License Key
            </span>
            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[200px]" title={license.code}>
              {license.code}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-3">
          <button
            type="button"
            onClick={onDeactivate}
            className="py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch / Deactivate License
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
