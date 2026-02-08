import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SERPAPI_KEY;
    
    // We search for events at your specific venues
    const query = "concerts at Moody Center Austin and Butler School of Music";
    
    console.log(`Fetching events for: ${query}`);

    // If no API key, return your mock data so the app doesn't break
    if (!apiKey) {
      console.warn("No SERPAPI_KEY found. Returning fallback events.");
      return NextResponse.json({
        events: [
          { id: '1', artist: "Taylor Swift (Mock)", venue: "Moody Center", date: "Tonight", genre: "pop", vibe: "sparkly, fun, colorful" },
          { id: '2', artist: "Red Hot Chili Peppers (Mock)", venue: "Moody Center", date: "Feb 18", genre: "rock", vibe: "grunge, denim, casual" },
        ]
      });
    }

    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_events',
        q: query,
        hl: 'en',
        gl: 'us',
        api_key: apiKey
      }
    });

    const eventsResult = response.data.events_results || [];

    // Clean up the data for your frontend
    const events = eventsResult.map((evt: any, index: number) => {
      // 1. Try to guess the "Vibe" based on the venue or title
      // (Since Google doesn't tell us the vibe, we make a safe guess)
      let calculatedGenre = "concert";
      let calculatedVibe = "comfortable stylish concert outfit";

      const title = (evt.title || "").toLowerCase();
      const venue = (evt.venue?.name || "").toLowerCase();

      if (venue.includes("butler") || title.includes("orchestra") || title.includes("opera")) {
        calculatedGenre = "classical";
        calculatedVibe = "smart casual, elegant, sophisticated";
      } else if (title.includes("tour")) {
         calculatedVibe = "trendy, fan aesthetic, statement piece";
      }

      return {
        id: `evt-${index}`,
        artist: evt.title, // Google puts the artist as the title
        venue: evt.venue?.name || "Austin, TX",
        date: evt.date?.start_date || "Upcoming",
        genre: calculatedGenre,
        vibe: calculatedVibe,
        link: evt.link
      };
    });

    return NextResponse.json({ events });

  } catch (error: any) {
    console.error('EVENTS API ERROR:', error.message);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}