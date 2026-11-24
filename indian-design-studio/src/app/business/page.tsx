import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessStudio from '@/components/Business/BusinessStudio';

export const metadata = {
  title: 'Business Design Studio - Indian Design Studio',
  description: 'Create visiting cards, GST tax invoices, certificates of achievement, and restaurant menus.',
};

export default function BusinessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <BusinessStudio />
      </main>
      <Footer />
    </div>
  );
}
