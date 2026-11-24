import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PassportPhotoStudio from '@/components/PhotoStudio/PassportPhotoStudio';

export const metadata = {
  title: 'Passport Photo Studio & A4 Multi-Print - Indian Design Studio',
  description: 'Indian passport 35x45mm photo maker, background color changer, and A4 multi-print sheet generator.',
};

export default function PhotoStudioPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <PassportPhotoStudio />
      </main>
      <Footer />
    </div>
  );
}
