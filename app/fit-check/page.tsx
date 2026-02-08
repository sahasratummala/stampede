import React from 'react';
import OutfitRecommender from '@/components/outfit-recommender';
import EventCalendar from '@/components/EventCalendar';

// 1. FIXED IMPORT: No parentheses here
import { Event, fetchAllEvents } from '@/lib/scraper';

export default async function FitCheckPage() {
  // 2. Fetch data from your scraper (Server-Side)
  const events: Event[] = await fetchAllEvents();

  return (
    <main className="min-h-screen bg-[#EAE8E1]">

      {/* 3. Pass events to OutfitRecommender */}
      <section className="mb-12">
        <OutfitRecommender events={events} />
      </section>

    </main>
  );
}