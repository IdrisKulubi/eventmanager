'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic imports with loading fallbacks
const DynamicConcertScene = dynamic(
  () => import('@/components/landing/ThreeScene/ConcertScene'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-gradient-to-b from-zinc-900 to-black" />
    ),
  }
);

const DynamicHero = dynamic(() => import('@/components/landing/Hero/Hero'), {
  loading: () => <div className="w-full h-[70vh] bg-gradient-to-b from-zinc-900 to-black" />,
});

const DynamicFeatures = dynamic(
  () => import('@/components/landing/Features/Features')
);

const DynamicUpcomingEvents = dynamic(
  () => import('@/components/landing/Events/UpcomingEvents')
);

const DynamicCallToAction = dynamic(
  () => import('@/components/landing/CallToAction/CallToAction')
);

const DynamicFooter = dynamic(
  () => import('@/components/shared/Footer/Footer')
);

export default function Home() {
  return (
    <main className="min-h-screen relative bg-gradient-to-b from-zinc-900 to-black text-white">
      {/* Background Three.js Animation */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={<div className="w-full h-screen bg-gradient-to-b from-zinc-900 to-black" />}>
          <DynamicConcertScene />
        </Suspense>
      </div>
      
      {/* Content Sections */}
      <div className="relative z-10">
        <DynamicHero />
        <DynamicFeatures />
        <DynamicUpcomingEvents />
        <DynamicCallToAction />
        <DynamicFooter />
      </div>
    </main>
  );
}
