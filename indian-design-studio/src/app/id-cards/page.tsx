import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IDCardMaker from '@/components/IDCard/IDCardMaker';

export const metadata = {
  title: 'CR80 ID Card Generator & Bulk Batch Maker - Indian Design Studio',
  description: 'Create school, college, and corporate identity cards with barcodes, QR codes, and 10-per-sheet A4 PDF printing.',
};

export default function IDCardsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <IDCardMaker />
      </main>
      <Footer />
    </div>
  );
}
