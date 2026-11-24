'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UserDashboard from '@/components/Dashboard/UserDashboard';
import PricingModal from '@/components/PricingModal';

export default function DashboardPage() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onOpenPricing={() => setIsPricingOpen(true)} />
      <main className="flex-1">
        <UserDashboard onOpenPricing={() => setIsPricingOpen(true)} />
      </main>
      <Footer />
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  );
}
