import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PosterMaker from '@/components/Posters/PosterMaker';

export const metadata = {
  title: 'Poster & Flex Banner Maker - Indian Design Studio',
  description: 'Design Indian festival banners, political campaign flex, coaching institute admissions, and retail sale posters in Hindi and English.',
};

export default function PostersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <PosterMaker />
      </main>
      <Footer />
    </div>
  );
}
