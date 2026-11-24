'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Award,
  Receipt,
  Utensils,
  FileCheck,
  Download,
  Edit3,
  Building,
  Check,
  CreditCard
} from 'lucide-react';
import { SAMPLE_TEMPLATES } from '@/lib/templatesData';
import { saveProject } from '@/lib/storage';

export default function BusinessStudio() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'visiting' | 'certificate' | 'menu' | 'invoice'>('visiting');

  // Business Card State
  const [visitingData, setVisitingData] = useState({
    name: 'Vikramaditya Singhania',
    title: 'Managing Director & Founder',
    company: 'Singhania Group of Industries',
    phone: '+91 98200 12345',
    email: 'vikram@singhaniagroup.in',
    website: 'www.singhaniagroup.in',
    address: 'Nariman Point, Mumbai - 400021',
  });

  // Certificate State
  const [certData, setCertData] = useState({
    title: 'Certificate of Excellence',
    presentedTo: 'Priyanka Kapoor',
    reason: 'In recognition of outstanding dedication and exemplary performance at the National Technology Summit 2026.',
    date: '24 November 2026',
    issuer: 'Director & General Secretary',
  });

  const handleOpenTemplate = (tplId: string) => {
    const tpl = SAMPLE_TEMPLATES.find((t) => t.id === tplId) || SAMPLE_TEMPLATES[0];
    const newProject = saveProject({
      id: `proj_biz_${Date.now()}`,
      title: tpl.title,
      category: 'business',
      width: tpl.width,
      height: tpl.height,
      thumbnail: tpl.thumbnail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: [
        {
          id: 'page_1',
          name: 'Business Canvas',
          canvasData: tpl.canvasData,
        },
      ],
    });

    router.push(`/editor?id=${newProject.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-2">
          <Briefcase className="w-3.5 h-3.5 text-amber-600" />
          Indian Business Stationery & Commercial Suite
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Professional Business Design Studio
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Create executive visiting cards, GST bill books, certificates of achievement, and restaurant menus customized for Indian enterprises.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {[
          { id: 'visiting', label: 'Visiting Cards (Front & Back)', icon: CreditCard },
          { id: 'certificate', label: 'Certificates of Excellence', icon: Award },
          { id: 'invoice', label: 'GST Invoices & Bill Books', icon: Receipt },
          { id: 'menu', label: 'Restaurant & Cafe Menus', icon: Utensils },
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
                isAct
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. VISITING CARDS */}
      {activeTab === 'visiting' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Visiting Card Information (3.5" x 2")
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={visitingData.name}
                onChange={(e) => setVisitingData({ ...visitingData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={visitingData.title}
                onChange={(e) => setVisitingData({ ...visitingData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={visitingData.company}
                onChange={(e) => setVisitingData({ ...visitingData, company: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={visitingData.phone}
                  onChange={(e) => setVisitingData({ ...visitingData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="text"
                  value={visitingData.email}
                  onChange={(e) => setVisitingData({ ...visitingData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => handleOpenTemplate('tpl-visiting-card-gold-black')}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Customize in Full Canva Editor
              </button>
            </div>
          </div>

          {/* Card Preview */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Luxury Matte Black & Gold Foil Preview
            </span>
            <div className="w-full aspect-[1.75/1] bg-zinc-900 rounded-2xl p-6 sm:p-8 border-2 border-amber-500/80 shadow-2xl flex flex-col justify-between text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full border border-amber-400/40 flex items-center justify-center font-cinzel font-bold text-amber-400">
                SG
              </div>
              <div>
                <h3 className="font-cinzel text-lg sm:text-xl font-bold tracking-wide">
                  {visitingData.name}
                </h3>
                <p className="text-xs text-amber-400 font-semibold mt-0.5 tracking-wider uppercase">
                  {visitingData.title}
                </p>
                <div className="w-16 h-0.5 bg-amber-500 mt-2 mb-1" />
              </div>

              <div className="space-y-1 text-xs text-zinc-300">
                <p>📞 {visitingData.phone}</p>
                <p>✉️ {visitingData.email}</p>
                <p>🌐 {visitingData.website}</p>
                <p>📍 {visitingData.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CERTIFICATES */}
      {activeTab === 'certificate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Certificate Information (A4 Landscape)
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate Title</label>
              <input
                type="text"
                value={certData.title}
                onChange={(e) => setCertData({ ...certData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Name</label>
              <input
                type="text"
                value={certData.presentedTo}
                onChange={(e) => setCertData({ ...certData, presentedTo: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Citation</label>
              <textarea
                rows={3}
                value={certData.reason}
                onChange={(e) => setCertData({ ...certData, reason: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="pt-3">
              <button
                onClick={() => handleOpenTemplate('tpl-certificate-excellence')}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Customize in Studio Editor
              </button>
            </div>
          </div>

          {/* Certificate Live Preview */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Gold Embellished Certificate Preview
            </span>
            <div className="w-full aspect-[1.414/1] bg-amber-50/30 rounded-2xl p-6 sm:p-8 border-4 border-amber-600/70 shadow-2xl flex flex-col justify-between text-center relative overflow-hidden">
              <div className="border border-dashed border-amber-500/40 p-4 h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-cinzel text-xl sm:text-2xl font-extrabold text-amber-900 tracking-wider">
                    {certData.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mt-1">
                    This is proudly awarded to
                  </p>
                </div>

                <div className="my-2">
                  <h2 className="font-script text-3xl sm:text-4xl text-blue-900 font-bold">
                    {certData.presentedTo}
                  </h2>
                  <div className="w-48 h-0.5 bg-amber-500 mx-auto mt-2" />
                </div>

                <p className="text-xs text-slate-700 max-w-sm mx-auto leading-relaxed">
                  {certData.reason}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-amber-200 text-left text-[10px] text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-800">Date of Award:</p>
                    <p>{certData.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-24 h-0.5 bg-slate-900 mb-1 ml-auto" />
                    <p className="font-semibold text-slate-800">Authorized Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. GST INVOICE & BILL BOOK */}
      {activeTab === 'invoice' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Tax Invoice / Bill Book (GST Compliant)</h3>
              <p className="text-xs text-slate-500">Standard Indian GST B2B & B2C Invoice Format</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
              GST Ready
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-slate-900">Seller / Printing Press:</p>
              <p className="text-slate-600 mt-1">Indian Design & Offset Printers</p>
              <p className="text-slate-600">GSTIN: 07AAAAA0000A1Z5</p>
              <p className="text-slate-600">State: Delhi (Code: 07)</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">Invoice No: INV-2026-9041</p>
              <p className="text-slate-600 mt-1">Date: 24-11-2026</p>
              <p className="text-slate-600">Due Date: 01-12-2026</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 font-bold uppercase text-[10px] text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5">HSN Code</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Rate (₹)</th>
                  <th className="p-2.5 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-medium text-slate-800">Wedding Invitation Printing (Royal Gold Embossed)</td>
                  <td className="p-2.5 text-slate-500">4911</td>
                  <td className="p-2.5 text-center">500</td>
                  <td className="p-2.5 text-right">₹35.00</td>
                  <td className="p-2.5 text-right font-semibold">₹17,500.00</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-800">CR80 Thermal PVC ID Cards with Lanyards</td>
                  <td className="p-2.5 text-slate-500">3926</td>
                  <td className="p-2.5 text-center">200</td>
                  <td className="p-2.5 text-right">₹45.00</td>
                  <td className="p-2.5 text-right font-semibold">₹9,000.00</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-semibold border-t border-slate-200 text-xs">
                <tr>
                  <td colSpan={4} className="p-2.5 text-right">Subtotal:</td>
                  <td className="p-2.5 text-right font-bold">₹26,500.00</td>
                </tr>
                <tr>
                  <td colSpan={4} className="p-2.5 text-right text-slate-600">CGST (9%) + SGST (9%):</td>
                  <td className="p-2.5 text-right font-semibold text-slate-700">₹4,770.00</td>
                </tr>
                <tr className="text-sm font-bold text-slate-900 border-t border-slate-200">
                  <td colSpan={4} className="p-2.5 text-right">Grand Total:</td>
                  <td className="p-2.5 text-right text-amber-700">₹31,270.00</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => alert('GST Tax Invoice PDF downloaded!')}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download GST Invoice PDF
            </button>
          </div>
        </div>
      )}

      {/* 4. RESTAURANT MENU */}
      {activeTab === 'menu' && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto p-8 space-y-4">
          <Utensils className="w-12 h-12 text-amber-600 mx-auto" />
          <h3 className="font-bold text-lg text-slate-900">Indian Dhaba & Fine-Dine Restaurant Menu Maker</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create multi-page laminated restaurant menus with Starters (Tandoori, Paneer Tikka), Main Course (Dal Makhani, Butter Chicken), Breads, and Desserts.
          </p>
          <button
            onClick={() => handleOpenTemplate('tpl-poster-diwali-sale')}
            className="py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Open Menu Template in Canvas Studio
          </button>
        </div>
      )}
    </div>
  );
}
