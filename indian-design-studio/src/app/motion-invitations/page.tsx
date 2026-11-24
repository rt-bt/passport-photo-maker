import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MotionInvitationMaker from '@/components/MotionInvitations/MotionInvitationMaker';

export const metadata = {
  title: 'Digital Animated Video Invitations - Indian Design Studio',
  description: 'Create animated Indian wedding and festival greeting video invitations with traditional Shehnai and Sitar audio.',
};

export default function MotionInvitationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <MotionInvitationMaker />
      </main>
      <Footer />
    </div>
  );
}
