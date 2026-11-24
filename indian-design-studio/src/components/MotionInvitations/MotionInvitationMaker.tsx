'use client';

import React, { useState, useEffect } from 'react';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  Music,
  Share2,
  Download,
  Sparkles,
  Heart,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export default function MotionInvitationMaker() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [audioTrack, setAudioTrack] = useState<string>('shehnai');
  const [effect, setEffect] = useState<'petals' | 'sparkles' | 'stars'>('sparkles');

  // Multi-slide sequential storyline
  const slides = [
    {
      id: 1,
      title: '॥ श्री गणेशाय नमः ॥',
      subtitle: 'With the heavenly blessings of Lord Ganesha',
      detail: 'The Families Cordially Invite You to Celebrate Love & Togetherness',
      bg: 'from-amber-900 via-rose-950 to-amber-950',
      icon: 'ॐ',
    },
    {
      id: 2,
      title: 'Rohan Sharma & Ananya Verma',
      subtitle: 'Are Tying the Knot',
      detail: 'Two Souls, Two Families, Bound by Sacred Traditions',
      bg: 'from-rose-950 via-purple-950 to-slate-950',
      icon: '❤️',
    },
    {
      id: 3,
      title: 'Sunday, 15th December 2026',
      subtitle: 'Shubh Vivah & Phera Ceremony',
      detail: '07:00 PM Onwards • The Royal Haveli Palace, Jaipur',
      bg: 'from-amber-950 via-red-950 to-orange-950',
      icon: '🏛️',
    },
    {
      id: 4,
      title: 'Blessings & RSVP',
      subtitle: 'Sharma & Verma Families',
      detail: 'Your presence and prayers will make our celebration unforgettable!',
      bg: 'from-emerald-950 via-teal-950 to-slate-950',
      icon: '✨',
    },
  ];

  // Auto-play timer loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
          <Film className="w-3.5 h-3.5 text-purple-600" />
          Motion Video & Digital WhatsApp Cards
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Digital Animated Wedding Video Maker
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Create animated multi-slide video invitations with royal Indian Shehnai & Sitar music, golden sparkle transitions, and instant WhatsApp video sharing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PLAYER CANVAS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-500/80 bg-black flex flex-col justify-between text-white p-8 select-none transition-all duration-700">
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-b ${slides[currentSlide].bg} transition-all duration-1000 opacity-90`}
            />

            {/* Sparkles / Petals Animation simulation */}
            <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />

            {/* Slide Header */}
            <div className="relative z-10 text-center pt-6 animate-in fade-in slide-in-from-top-4 duration-700">
              <span className="text-4xl block mb-3">{slides[currentSlide].icon}</span>
              <h2 className="text-xl sm:text-2xl font-bold font-rozha text-amber-300 tracking-wide">
                {slides[currentSlide].title}
              </h2>
            </div>

            {/* Slide Center Details */}
            <div className="relative z-10 text-center my-auto px-4 py-8 bg-black/30 backdrop-blur-xs rounded-2xl border border-amber-400/20 animate-in fade-in zoom-in-95 duration-500">
              <h3 className="text-lg font-script text-amber-200">
                {slides[currentSlide].subtitle}
              </h3>
              <div className="w-16 h-0.5 bg-amber-400 mx-auto my-3" />
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {slides[currentSlide].detail}
              </p>
            </div>

            {/* Slide Navigation Dots */}
            <div className="relative z-10 flex items-center justify-center gap-2 pb-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Player Controls Bar */}
          <div className="max-w-sm mx-auto bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-xs">
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
              }
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-5 py-2 bg-gradient-to-r from-amber-600 to-rose-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" /> Pause Motion
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> Play Animation
                </>
              )}
            </button>

            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % slides.length)
              }
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTROLS & MUSIC SETTINGS (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            Audio & Motion Settings
          </h3>

          {/* Background Music Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              Select Background Music Preset
            </label>
            <div className="space-y-2">
              {[
                { id: 'shehnai', title: 'Royal Shehnai & Dholak (Ustad Bismillah Style)', duration: '0:35 min' },
                { id: 'sitar', title: 'Acoustic Sitar & Romantic Flute Melody', duration: '0:42 min' },
                { id: 'fusion', title: 'Modern Cinematic Wedding Symphony', duration: '0:30 min' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAudioTrack(m.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    audioTrack === m.id
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Music className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-xs block">{m.title}</span>
                      <span className="text-[10px] text-slate-500">{m.duration}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Effect */}
          <div className="border-t border-slate-100 pt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              Visual Particle Overlay
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'sparkles', label: 'Golden Dust' },
                { id: 'petals', label: 'Rose Petals' },
                { id: 'stars', label: 'Starry Sky' },
              ].map((eff) => (
                <button
                  key={eff.id}
                  onClick={() => setEffect(eff.id as any)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    effect === eff.id
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {eff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="pt-4 space-y-3">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `🎬 Digital Animated Wedding Invitation\nRohan & Ananya Vivah\nWatch the full motion video here: ${typeof window !== 'undefined' ? window.location.href : ''}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share Motion Card on WhatsApp
            </a>

            <button
              onClick={() => alert('Motion video export rendering initiated (MP4 format).')}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Full HD Video (MP4)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
