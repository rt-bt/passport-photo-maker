'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CanvaEditor from '@/components/Editor/CanvaEditor';

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
        <div className="flex items-center justify-center h-screen w-screen bg-slate-100 text-slate-600 text-sm font-semibold">
          Loading Indian Design Studio Canvas...
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
