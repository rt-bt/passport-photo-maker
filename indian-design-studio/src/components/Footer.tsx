import React from 'react';
import Link from 'next/link';
import { Palette, Heart, ShieldCheck, Printer, Sparkles, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Indian Design<span className="text-amber-500"> Studio</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India’s first all-in-one graphic design and document SaaS platform built specifically for Indian weddings, schools, printing presses, and modern businesses.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Designed & Engineered with pride in Bengaluru & Delhi, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>support@indiandesignstudio.in</span>
              </div>
            </div>
          </div>

          {/* Design Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-4">
              Core Studios
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/wedding" className="hover:text-white transition-colors">
                  Wedding Invitations
                </Link>
              </li>
              <li>
                <Link href="/id-cards" className="hover:text-white transition-colors">
                  School & Employee ID Cards
                </Link>
              </li>
              <li>
                <Link href="/posters" className="hover:text-white transition-colors">
                  Festival & Political Posters
                </Link>
              </li>
              <li>
                <Link href="/business" className="hover:text-white transition-colors">
                  Visiting Cards & Invoices
                </Link>
              </li>
              <li>
                <Link href="/photo-studio" className="hover:text-white transition-colors">
                  Passport Photo Studio
                </Link>
              </li>
              <li>
                <Link href="/motion-invitations" className="hover:text-white transition-colors">
                  Digital Motion Invitations
                </Link>
              </li>
            </ul>
          </div>

          {/* AI & Print Tech */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-4">
              Print & AI Features
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/ai-studio" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  AI Prompt to Design
                </Link>
              </li>
              <li>
                <Link href="/ai-studio" className="hover:text-white transition-colors">
                  Hindi AI Copywriter
                </Link>
              </li>
              <li>
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  300 DPI High-Res Export
                </span>
              </li>
              <li>
                <span className="text-slate-400">CR80 PVC Batch Printing</span>
              </li>
              <li>
                <span className="text-slate-400">A4 10-Card Print Sheets</span>
              </li>
              <li>
                <span className="text-slate-400">Crop Marks & Bleed Setup</span>
              </li>
            </ul>
          </div>

          {/* Account & Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-4">
              Platform & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-400">Terms of Service</span>
              </li>
              <li>
                <span className="text-slate-400">Commercial License</span>
              </li>
              <li>
                <span className="text-slate-400">GST Invoice Available</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Indian Design Studio Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Bharat Creators & Printing Presses</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
