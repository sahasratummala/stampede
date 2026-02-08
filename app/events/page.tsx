import { fetchAllEvents } from '@/lib/scraper';
import EventCalendar from '@/components/EventCalendar';

interface Event {
    id: string;
    title: string;
    date: string;
    venue: string;
    image?: string;
    link: string;
}

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
    let scrapedEvents: Event[] = []; 
    
    try {
        // We wrap this specifically so the "No API Key" error 
        // doesn't crash the whole landing experience.
        scrapedEvents = await fetchAllEvents();
    } catch (error) {
        console.warn("Scraper partially failed (likely missing API keys), but continuing...");
        scrapedEvents = [];
    }

    const manualEvents: Event[] = [
        {
            id: 'lalaland-feb14',
            title: 'La La Land in Concert',
            date: '2026-02-14',
            venue: 'Texas Performing Arts',
            link: 'https://texasperformingarts.org/event/la-la-land-in-concert-2026-bass-concert-hall-austin-texas/',
            image: 'https://res.cloudinary.com/ds5gdw0uw/images/c_scale,w_1560,h_693,dpr_2/f_auto,q_auto:good/v1755187454/LaLaLand_Event_Hero_1920x853/LaLaLand_Event_Hero_1920x853.png?_i=AA'
        }
    ];

    // Combine them safely
    const allEvents = [...(scrapedEvents || []), ...manualEvents];

    return (
        <main className="min-h-screen bg-background">
            <EventCalendar initialEvents={allEvents} />
        </main>
    );
}