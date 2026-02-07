import axios from 'axios';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.SERPAPI_KEY;
    
    // We search for events at your specific venues
    // You can add more venues to this query string if needed
    const query = "concerts at Moody Center Austin and Butler School of Music";
    
    console.log(`Fetching events for: ${query}`);

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
    const events = eventsResult.map((evt, index) => {
      // 1. Try to guess the "Vibe" based on the venue or title
      // (Since Google doesn't tell us the vibe, we make a safe guess)
      let calculatedGenre = "concert";
      let calculatedVibe = "comfortable stylish concert outfit";

      const title = evt.title.toLowerCase();
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

    res.status(200).json({ events });

  } catch (error) {
    console.error('EVENTS API ERROR:', error.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}