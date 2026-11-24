'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const CanvaEditor = dynamic(() => import('@/components/Editor/CanvaEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-900 text-slate-100">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-semibold tracking-wide">Loading Indian Design Studio Canvas...</p>
    </div>
  ),
});

function EditorContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || undefined;
  const templateId = searchParams.get('template') || undefined;

  return <CanvaEditor initialProjectId={id} initialTemplateId={templateId} />;
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen w-screen bg-slate-900 text-slate-100">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-semibold tracking-wide">Initializing Canvas...</p>
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
