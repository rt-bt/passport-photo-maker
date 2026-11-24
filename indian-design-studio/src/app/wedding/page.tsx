import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WeddingCardWizard from '@/components/Wedding/WeddingCardWizard';

export const metadata = {
  title: 'Indian Wedding Card Designer - Indian Design Studio',
  description: 'Design Hindu, Muslim, Sikh, South Indian and Rajasthani wedding invitations with Google Maps QR codes and WhatsApp sharing.',
};

export default function WeddingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <WeddingCardWizard />
      </main>
      <Footer />
    </div>
  );
}
