import { fetchAllEvents } from '@/lib/scraper';
import EventCalendar from '@/components/EventCalendar';

export const dynamic = 'force-dynamic';

export default async function Page() {
    let allEvents = [];
    try {
        // fetchAllEvents now includes manual TPA events + filters out unwanted events
        allEvents = await fetchAllEvents();
    } catch (error) {
        console.error("Scraper Error:", error);
        allEvents = [];
    }

    return (
        <div className="min-h-screen font-sans bg-background selection:bg-accent selection:text-white transition-colors duration-300">
            <EventCalendar initialEvents={allEvents} />
        </div>
    );
}