import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminDashboard from '@/components/Admin/AdminDashboard';

export const metadata = {
  title: 'Admin Control Center - Indian Design Studio',
  description: 'Manage users, templates, platform revenue, and Gemini AI allocations.',
};

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <AdminDashboard />
      </main>
      <Footer />
    </div>
  );
}
