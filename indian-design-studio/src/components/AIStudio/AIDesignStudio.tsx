'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Wand2,
  Send,
  Copy,
  Check,
  Edit3,
  AlertCircle,
  Key,
  BookOpen,
  Languages,
  PenTool
} from 'lucide-react';
import { saveProject } from '@/lib/storage';

export default function AIDesignStudio() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'generator' | 'writer' | 'chatEdit'>('generator');

  // Generator State
  const [designPrompt, setDesignPrompt] = useState<string>(
    'Create a premium royal Hindu wedding invitation with red and golden colors, floral decorations and elegant Hindi typography.'
  );
  const [isGeneratingDesign, setIsGeneratingDesign] = useState<boolean>(false);
  const [designError, setDesignError] = useState<string | null>(null);

  // Writer State
  const [writerCategory, setWriterCategory] = useState<string>('wedding');
  const [writerPrompt, setWriterPrompt] = useState<string>(
    'Write emotional Hindi wedding invitation wording from bride and groom parents inviting family to wedding in Jaipur.'
  );
  const [writerLanguage, setWriterLanguage] = useState<'Hindi' | 'English'>('Hindi');
  const [writerResult, setWriterResult] = useState<string>('');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState<boolean>(false);
  const [writerError, setWriterError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Natural Language Chat Edit State
  const [editInstruction, setEditInstruction] = useState<string>(
    'Change the background to royal cream silk and make all primary headings rich antique gold.'
  );
  const [isEditingChat, setIsEditingChat] = useState<boolean>(false);
  const [editResult, setEditResult] = useState<string>('');

  // Handle AI Design Generator
  const handleGenerateDesign = async () => {
    setIsGeneratingDesign(true);
    setDesignError(null);

    try {
      const res = await fetch('/api/ai/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: designPrompt, category: 'wedding' }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsApiKey) {
          setDesignError(
            'Google Gemini API Key is required. Please set GEMINI_API_KEY in your .env.local file to enable live AI design generation.'
          );
        } else {
          setDesignError(data.error || 'Failed to generate design with AI.');
        }
        setIsGeneratingDesign(false);
        return;
      }

      if (data.design?.canvasData) {
        const newProj = saveProject({
          id: `proj_ai_${Date.now()}`,
          title: data.design.title || 'AI Generated Design',
          category: 'wedding',
          width: data.design.width || 1200,
          height: data.design.height || 1800,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pages: [
            {
              id: 'page_1',
              name: 'AI Design Page',
              canvasData: data.design.canvasData,
            },
          ],
        });
        router.push(`/editor?id=${newProj.id}`);
      }
    } catch (err: any) {
      setDesignError(err?.message || 'Network error connecting to AI service.');
    } finally {
      setIsGeneratingDesign(false);
    }
  };

  // Handle AI Copywriting
  const handleGenerateCopy = async () => {
    setIsGeneratingCopy(true);
    setWriterError(null);
    setWriterResult('');

    try {
      const res = await fetch('/api/ai/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: writerCategory,
          prompt: writerPrompt,
          language: writerLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsApiKey) {
          setWriterError(
            'Google Gemini API Key is required. Please add GEMINI_API_KEY="your_key" in your .env.local file.'
          );
        } else {
          setWriterError(data.error || 'AI copywriting request failed.');
        }
        setIsGeneratingCopy(false);
        return;
      }

      setWriterResult(data.text || 'No text received.');
    } catch (err: any) {
      setWriterError(err?.message || 'Network error connecting to AI copywriting API.');
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const copyToClipboard = () => {
    if (!writerResult) return;
    navigator.clipboard?.writeText(writerResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Powered by Google Gemini 1.5 & Generative AI
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          AI Design Studio & Indian Copywriter
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Generate editable canvas templates from plain text descriptions, draft authentic Hindi wedding invitations, and refine ad slogans in seconds.
        </p>
      </div>

      {/* API Key Instructions Alert */}
      <div className="mb-8 p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-xs flex items-start gap-3 shadow-sm">
        <Key className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Backend AI Integration:</span>
          <p className="text-slate-300 mt-0.5 leading-relaxed">
            All AI capabilities connect to real Google Gemini models via secure Next.js server endpoints. Set <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">GEMINI_API_KEY</code> in <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">.env.local</code> to run live generations without rate limits.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'generator'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-600" />
            Prompt to Design Canvas
          </button>
          <button
            onClick={() => setActiveTab('writer')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'writer'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            Hindi & English Copywriter
          </button>
        </div>
      </div>

      {/* 1. PROMPT TO DESIGN CANVAS */}
      {activeTab === 'generator' && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Describe the Design You Want to Create
            </label>
            <textarea
              rows={4}
              value={designPrompt}
              onChange={(e) => setDesignPrompt(e.target.value)}
              placeholder="e.g. Create a royal Hindu wedding invitation with red and golden colors, floral decorations and elegant Hindi typography..."
              className="w-full p-3.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Quick Prompt Ideas */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Sample Prompt Ideas:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Royal Rajasthani Hindu wedding with Kalash and golden shloka',
                'Grand Diwali Dhamaka 50% discount sale poster in Hindi',
                'CBSE School Student Identity Card with blue header and barcode',
                'Modern Gold and Black executive visiting card with QR code',
              ].map((idea, i) => (
                <button
                  key={i}
                  onClick={() => setDesignPrompt(idea)}
                  className="text-xs text-slate-600 bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {designError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">AI Service Notice:</p>
                <p>{designError}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerateDesign}
            disabled={isGeneratingDesign}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            {isGeneratingDesign ? 'Synthesizing Design with Gemini AI...' : 'Generate Editable Canvas Design'}
          </button>
        </div>
      )}

      {/* 2. HINDI & ENGLISH COPYWRITER */}
      {activeTab === 'writer' && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              AI Copywriting Assistant
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={writerCategory}
                onChange={(e) => setWriterCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="wedding">Indian Wedding Invitation Wording</option>
                <option value="festival">Festival Greeting & Wishes</option>
                <option value="advertisement">Hindi Business Ad Slogan & Offer</option>
                <option value="social">Instagram Caption with Hashtags</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Language
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setWriterLanguage('Hindi')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                    writerLanguage === 'Hindi'
                      ? 'bg-amber-50 border-amber-400 text-amber-900'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  हिन्दी (Devanagari)
                </button>
                <button
                  onClick={() => setWriterLanguage('English')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                    writerLanguage === 'English'
                      ? 'bg-amber-50 border-amber-400 text-amber-900'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Requirement
              </label>
              <textarea
                rows={4}
                value={writerPrompt}
                onChange={(e) => setWriterPrompt(e.target.value)}
                placeholder="What text do you need written?"
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {writerError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {writerError}
              </div>
            )}

            <button
              onClick={handleGenerateCopy}
              disabled={isGeneratingCopy}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGeneratingCopy ? 'Writing with Gemini AI...' : 'Draft Creative Copy Options'}
            </button>
          </div>

          {/* Generated Result Output */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">AI Generated Copy</h3>
              {writerResult && (
                <button
                  onClick={copyToClipboard}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {writerResult ? (
              <div className="whitespace-pre-line text-xs text-slate-700 leading-relaxed max-h-[380px] overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200 font-hindi">
                {writerResult}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                <PenTool className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                Fill in the prompt on the left and click Generate to produce professional copy.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
