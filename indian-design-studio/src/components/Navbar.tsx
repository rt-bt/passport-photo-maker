'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Palette,
  CreditCard,
  User,
  Plus,
  Layers,
  Crown,
  Camera,
  Film,
  Menu,
  X,
  FileText,
  HeartHandshake
} from 'lucide-react';
import { getUserProfile } from '@/lib/storage';
import { UserProfile } from '@/types';

interface NavbarProps {
  onOpenAuth?: () => void;
  onOpenPricing?: () => void;
  onNewDesign?: () => void;
}

export default function Navbar({ onOpenAuth, onOpenPricing, onNewDesign }: NavbarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getUserProfile());
  }, []);

  const navLinks = [
    { label: 'Templates', href: '/templates', icon: Layers },
    { label: 'Wedding Cards', href: '/wedding', icon: HeartHandshake },
    { label: 'ID Cards', href: '/id-cards', icon: CreditCard },
    { label: 'Posters', href: '/posters', icon: FileText },
    { label: 'Business', href: '/business', icon: Palette },
    { label: 'AI Studio', href: '/ai-studio', icon: Sparkles, badge: 'AI' },
    { label: 'Photo Studio', href: '/photo-studio', icon: Camera },
    { label: 'Motion Video', href: '/motion-invitations', icon: Film },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors">
                  Indian Design<span className="text-amber-600"> Studio</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                  Desi Canva & SaaS Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-amber-50 text-amber-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                    {link.badge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Pricing Button */}
            <button
              onClick={onOpenPricing}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-amber-700 flex items-center gap-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              Pricing
            </button>

            {/* My Dashboard */}
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Dashboard
            </Link>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title={`${user.name} (${user.plan.toUpperCase()} Plan)`}
                >
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-semibold flex items-center justify-center text-xs border border-amber-300">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-medium text-slate-800 leading-none">{user.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-amber-600 font-semibold uppercase">{user.plan}</span>
                  </div>
                </Link>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Main CTA: Create Design */}
            <Link
              href="/editor"
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 rounded-lg shadow-sm shadow-orange-500/20 hover:shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Design
            </Link>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/editor"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Design
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-amber-600" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              My Dashboard & Projects
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPricing?.();
              }}
              className="text-left px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg flex items-center gap-2"
            >
              <Crown className="w-4 h-4 text-amber-500" />
              Upgrade to Pro / Business
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
