import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TemplateMarketplace from '@/components/Templates/TemplateMarketplace';

export const metadata = {
  title: 'Indian Design Templates Catalog - Indian Design Studio',
  description: 'Search hundreds of authentic Indian templates for wedding invitations, ID cards, posters, and business cards.',
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <TemplateMarketplace />
      </main>
      <Footer />
    </div>
  );
}
