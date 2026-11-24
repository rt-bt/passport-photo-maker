'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Layers,
  Sparkles,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  Settings,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_TEMPLATES } from '@/lib/templatesData';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'templates' | 'users'>('metrics');

  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'Aaditya Sharma', email: 'aaditya@designstudio.in', plan: 'PRO', credits: 250, role: 'Admin' },
    { id: 'u2', name: 'Priya Nair', email: 'priya@delhipress.in', plan: 'BUSINESS', credits: 940, role: 'User' },
    { id: 'u3', name: 'Zaid Khan', email: 'zaid@lucknowweddings.com', plan: 'STARTER', credits: 45, role: 'User' },
    { id: 'u4', name: 'Rajesh Verma', email: 'rajesh@apexprint.co.in', plan: 'BUSINESS', credits: 820, role: 'User' },
  ]);

  const handleGrantCredits = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, credits: u.credits + 100 } : u))
    );
    alert('Granted 100 AI Credits to user!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Superadmin Control Panel
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Indian Design Studio Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Platform performance metrics, template inventory, and subscription oversight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/editor"
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Template
          </Link>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue (MTD)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹4,89,500</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +28% vs last month
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Presses & Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">12,840</div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            Across 28 Indian States
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">300 DPI Exports</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">48,912</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Print-ready PDFs & PNGs
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gemini AI Invocations</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">89,240</div>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
            99.8% Success Rate
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'metrics'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          System Health & Logs
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User Accounts & Credits ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Template Catalog Management ({SAMPLE_TEMPLATES.length})
        </button>
      </div>

      {/* 1. USERS LIST TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">Platform Registered Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">AI Credits</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                        {u.plan}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-purple-700">{u.credits}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleGrantCredits(u.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-300"
                      >
                        + 100 Credits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TEMPLATES INVENTORY TAB */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">Template Inventory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAMPLE_TEMPLATES.map((t) => (
              <div
                key={t.id}
                className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 mb-2">
                    <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{t.title}</h4>
                  <span className="text-[10px] text-amber-700 font-semibold">{t.subcategory}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200">
                  <span className="text-slate-500">{t.language}</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. METRICS / SYSTEM HEALTH */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-slate-900">System Telemetry & Storage</h3>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Fabric.js Canvas Engine:</span>
                <span className="font-semibold text-emerald-600">v5.3.0 Ready</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-slate-100">
                <span>PDF Generation Engine (jsPDF):</span>
                <span className="font-semibold text-emerald-600">Operational (300 DPI)</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Google Gemini 1.5 API:</span>
                <span className="font-semibold text-emerald-600">Configured in Route Handlers</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Razorpay Indian Payment Gateway:</span>
                <span className="font-semibold text-blue-600">Sandbox / Ready for API Key</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-slate-900">Production Checklist</h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-faith Indian Wedding Invitation Designer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>CR80 PVC ID Card Maker with Excel Bulk Import</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Festival & Political Poster Maker with Hindi Typography</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Passport Photo Studio with 35x45mm & A4 Multi-print Sheets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full Browser Drag-and-Drop Canva-style Editor</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
