import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIDesignStudio from '@/components/AIStudio/AIDesignStudio';

export const metadata = {
  title: 'AI Design Studio & Indian Copywriter - Indian Design Studio',
  description: 'Generate editable graphic designs from prompts and write Hindi wedding invitation copy using Google Gemini 1.5.',
};

export default function AIStudioPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <AIDesignStudio />
      </main>
      <Footer />
    </div>
  );
}
