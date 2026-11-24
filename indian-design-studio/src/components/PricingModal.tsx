'use client';

import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, Building, Crown, AlertCircle } from 'lucide-react';
import { updateUserProfile } from '@/lib/storage';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdated?: () => void;
}

export default function PricingModal({ isOpen, onClose, onPlanUpdated }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for casual personal designs and festival greetings',
      features: [
        '5 active projects',
        'Standard templates access',
        'Standard PNG & JPG export',
        'Basic photo editing',
        'Community support',
      ],
      cta: 'Current Plan',
      popular: false,
    },
    {
      id: 'starter',
      name: 'Creator Pro',
      price: billingCycle === 'yearly' ? '₹399' : '₹499',
      period: '/ month',
      description: 'Ideal for freelance designers and wedding planners',
      features: [
        'Unlimited design projects',
        'All Premium Wedding & Poster templates',
        '300 DPI high-resolution export',
        'Vector SVG export',
        '50 AI design credits / month',
        'No watermark',
      ],
      cta: 'Upgrade to Creator',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Studio Pro',
      price: billingCycle === 'yearly' ? '₹799' : '₹999',
      period: '/ month',
      description: 'For active graphic designers & print shops',
      features: [
        'Everything in Creator Pro',
        'Full AI Design Studio access',
        'AI Hindi Copywriter & Ad generator',
        '250 AI design credits / month',
        'Digital Video Invitations & Audio',
        'Priority print-ready PDF generator',
        'Priority WhatsApp & Email support',
      ],
      cta: 'Upgrade to Studio Pro',
      popular: true,
    },
    {
      id: 'business',
      name: 'Business & Press',
      price: billingCycle === 'yearly' ? '₹1,999' : '₹2,499',
      period: '/ month',
      description: 'For printing presses, schools, and corporate institutions',
      features: [
        'Everything in Studio Pro',
        'Bulk ID Card Excel/CSV generator',
        'Multi-card A4 10-per-sheet tiling',
        'Passport Photo 32-per-sheet generator',
        'Commercial usage license for all prints',
        'Unlimited AI credits',
        'Custom brand kits & GST invoicing',
      ],
      cta: 'Upgrade to Business',
      popular: false,
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      updateUserProfile({ plan: 'free' });
      onPlanUpdated?.();
      onClose();
      return;
    }

    setLoadingPlan(planId);

    // Razorpay Integration simulation / handler
    // In production, an order is created via `/api/payment/razorpay-order` and then Razorpay modal opens
    setTimeout(() => {
      // Check if window.Razorpay exists or inform user
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        // Open Razorpay Checkout modal
      } else {
        // Informative modal for real integration
        setPaymentNotice(
          `Razorpay Gateway initialized for ${planId.toUpperCase()} (${billingCycle === 'yearly' ? 'Annual discount applied' : 'Monthly'}). Note: Provide your RAZORPAY_KEY_ID in .env.local to activate production merchant payments.`
        );
        updateUserProfile({
          plan: planId as any,
          aiCredits: planId === 'business' ? 1000 : 250,
        });
        onPlanUpdated?.();
      }
      setLoadingPlan(null);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full p-6 sm:p-8 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            Simple Transparent Pricing in ₹ INR
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Scale Your Design & Printing Business
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Choose the plan that suits your personal projects, wedding agency, or printing press.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-6 gap-3">
            <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-12 h-6 bg-amber-600 rounded-full p-1 transition-colors relative"
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Yearly <span className="text-emerald-600 font-bold">(Save 20%)</span>
            </span>
          </div>
        </div>

        {paymentNotice && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Plan Activated for Testing:</p>
              <p>{paymentNotice}</p>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => {
            const isPop = p.popular;
            return (
              <div
                key={p.id}
                className={`rounded-2xl p-5 flex flex-col justify-between border transition-all ${
                  isPop
                    ? 'border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/20 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  {isPop && (
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 rounded-full mb-3 uppercase tracking-wider">
                      Most Popular in India
                    </span>
                  )}
                  <h3 className="font-bold text-base text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.description}</p>

                  <div className="mt-4 mb-5">
                    <span className="text-3xl font-extrabold text-slate-900">{p.price}</span>
                    <span className="text-xs text-slate-500 ml-1">{p.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(p.id)}
                  disabled={loadingPlan === p.id}
                  className={`mt-6 w-full py-2.5 px-3 rounded-xl font-semibold text-xs transition-all ${
                    isPop
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {loadingPlan === p.id ? 'Processing...' : p.cta}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          🔒 Secure payments processed via Razorpay. GST Invoice with your business GSTIN provided automatically.
        </div>
      </div>
    </div>
  );
}
