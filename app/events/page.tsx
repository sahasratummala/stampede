import { fetchAllEvents } from '@/lib/scraper';
import EventCalendar from '@/components/EventCalendar';

// 1. Define the Event interface to match your scraper's output
// This tells TypeScript what kind of data to expect in the array
interface Event {
  id: string | number;
  title: string;
  date: string; // ISO string or formatted date
  location?: string;
  image?: string;
  url?: string;
  category?: string;
  description?: string;
}

export const dynamic = 'force-dynamic';

export default async function Page() {
    // 2. Initialize with the correct type: Event[]
    let allEvents: Event[] = [];

    try {
        // fetchAllEvents now includes manual TPA events + filters out unwanted events
        const data = await fetchAllEvents();
        
        // Ensure data is an array before assigning
        allEvents = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Scraper Error:", error);
        allEvents = [];
    }

    return (
        <div className="min-h-screen font-sans bg-background selection:bg-accent selection:text-white transition-colors duration-300">
            {/* 3. Pass the typed array to your Calendar component */}
            <EventCalendar initialEvents={allEvents} />
        </div>
    );
}