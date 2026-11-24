'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Download,
  Calendar,
  Sparkles,
  CreditCard,
  Crown,
  Camera,
  ExternalLink,
  Check
} from 'lucide-react';
import { DesignProject, UserProfile } from '@/types';
import {
  getSavedProjects,
  deleteProject,
  duplicateProject,
  getUserProfile,
  getUploadedImages
} from '@/lib/storage';

interface UserDashboardProps {
  onOpenPricing?: () => void;
}

export default function UserDashboard({ onOpenPricing }: UserDashboardProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [uploads, setUploads] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'uploads' | 'subscription'>('projects');

  useEffect(() => {
    setProjects(getSavedProjects());
    setUser(getUserProfile());
    setUploads(getUploadedImages());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      setProjects(getSavedProjects());
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateProject(id);
    setProjects(getSavedProjects());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs mb-2">
            Creator Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, {user?.name || 'Designer'}!
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-md">
            Manage your Indian wedding cards, school IDs, and print orders in one centralized workspace.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 text-center min-w-[100px]">
            <span className="block text-2xl font-black">{projects.length}</span>
            <span className="text-[10px] text-amber-200 uppercase font-semibold">Saved Designs</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 text-center min-w-[100px]">
            <span className="block text-2xl font-black">{user?.aiCredits ?? 250}</span>
            <span className="text-[10px] text-amber-200 uppercase font-semibold">AI Credits</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 text-center min-w-[100px]">
            <span className="block text-sm font-bold uppercase tracking-wide mt-1">
              {user?.plan || 'PRO'} PLAN
            </span>
            <button
              onClick={onOpenPricing}
              className="text-[10px] text-amber-200 underline font-semibold mt-0.5 hover:text-white"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'projects'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Saved Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('uploads')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'uploads'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Uploaded Assets ({uploads.length})
          </button>
        </div>

        <Link
          href="/editor"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Design
        </Link>
      </div>

      {/* 1. PROJECTS GRID */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => router.push(`/editor?id=${proj.id}`)}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                  {proj.thumbnail ? (
                    <img
                      src={proj.thumbnail}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Preview
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDuplicate(proj.id, e)}
                      title="Duplicate"
                      className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:text-slate-900 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(proj.id, e)}
                      title="Delete"
                      className="p-1.5 rounded-lg bg-white/90 text-rose-600 hover:bg-rose-50 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                    {proj.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{proj.width} × {proj.height} px</span>
                    <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/editor?id=${proj.id}`);
                  }}
                  className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit in Studio
                </button>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">You haven't saved any designs yet.</p>
              <Link
                href="/editor"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline"
              >
                <Plus className="w-4 h-4" /> Start your first design
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 2. UPLOADS GALLERY */}
      {activeTab === 'uploads' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {uploads.map((src, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs group relative"
              >
                <img src={src} alt="Upload" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {uploads.length === 0 && (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
              <Camera className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No images uploaded yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
