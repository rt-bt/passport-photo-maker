import React, { useState } from 'react';
import { KeyRound, Copy, Check, ShieldCheck, Sparkles, Mail, User, MessageSquare } from 'lucide-react';
import { PlanDuration, APP_PLANS } from '../../types/subscription';
import { generateClientLicense } from '../../lib/licensing';
import { Modal } from '../common/Modal';

interface AdminGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminGeneratorModal: React.FC<AdminGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanDuration>('1_year');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const email = clientEmail.trim();
    if (!email) {
      setFormError('Please enter a valid Client Email ID.');
      return;
    }
    if (!email.includes('@')) {
      setFormError('Please enter a valid email format (e.g. client@example.com).');
      return;
    }

    const key = generateClientLicense(email, selectedPlan);
    setGeneratedKey(key);
    setCopied(false);
    setCopiedMsg(false);
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyWhatsAppMsg = () => {
    if (!generatedKey) return;
    const plan = APP_PLANS[selectedPlan];
    const email = clientEmail.trim();
    const name = clientName.trim() || 'Valued Client';
    const msg = `🎉 *TrueTone & Passport Studio Pro Activated!*\n\n` +
      `👤 *Client Name:* ${name}\n` +
      `📧 *User ID (Email):* ${email}\n` +
      `📦 *Plan:* ${plan.title}\n` +
      `🔑 *License Key:* \`${generatedKey}\`\n\n` +
      `👉 *How to access:* Open the app website, enter your Email ID and License Key to unlock full studio access.\n` +
      `Thank you for subscribing!`;

    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admin License Key Generator" maxWidth="lg">
      <div className="space-y-6 text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-3 p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Admin Console:</strong> Generate cryptographically signed licenses tied directly to the client's Email ID.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Client Email Address (User ID) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. client@gmail.com"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Client Name / Remarks (Optional)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Select Subscription Plan Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(APP_PLANS) as PlanDuration[]).map((planKey) => {
                const plan = APP_PLANS[planKey];
                const isSelected = selectedPlan === planKey;
                return (
                  <button
                    key={planKey}
                    type="button"
                    onClick={() => setSelectedPlan(planKey)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      {plan.title}
                      {planKey === 'lifetime' && <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {plan.days === 0 ? 'Unlimited lifetime' : `${plan.days} days validity`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {formError && (
            <p className="text-xs text-rose-500">{formError}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            Generate Client ID & License Key
          </button>
        </form>

        {generatedKey && (
          <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Generated License Key (Ready to Deliver)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                {APP_PLANS[selectedPlan].code}
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              <strong>User ID (Email):</strong> {clientEmail.trim().toLowerCase()}
            </div>

            <div className="p-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-blue-600 dark:text-blue-400 break-all select-all">
              {generatedKey}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyKey}
                className="flex-1 py-2 px-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Key!' : 'Copy License Key'}
              </button>

              <button
                type="button"
                onClick={handleCopyWhatsAppMsg}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {copiedMsg ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                {copiedMsg ? 'Message Copied!' : 'Copy WhatsApp Message'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
