// lib/scraper.ts
import * as cheerio from 'cheerio';

// Define the Event interface
export interface Event {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    venue: string;
    image?: string;
    link: string;
    description?: string;
}

// HELPER: Prevent Timezone "One Day Behind" Glitch
function parseSafeDate(dateStr: string): string {
    if (!dateStr || dateStr === 'TBA') return 'TBA';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'TBA';

        // Create UTC date parts to avoid local timezone shifting
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');

        return `${y}-${m}-${day}`;
    } catch {
        return 'TBA';
    }
}

// --- BUTLER SCHOOL OF MUSIC (PAGINATED) ---
async function scrapeButler(): Promise<Event[]> {
    const baseUrl = 'https://music.utexas.edu';
    const pages = [0, 1, 2, 3];
    const allLinks = new Map<string, { url: string, title: string }>();

    try {
        await Promise.all(pages.map(async (pageNum) => {
            try {
                const res = await fetch(`${baseUrl}/events?page=${pageNum}`, {
                    next: { revalidate: 3600 }
                });
                if (!res.ok) return;
                const html = await res.text();
                const $ = cheerio.load(html);

                $('a[href*="/events/"]').each((_, el) => {
                    const href = $(el).attr('href');
                    const title = $(el).text().trim();
                    if (href && title && href.match(/\/events\/\d+-/)) {
                        const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
                        allLinks.set(fullUrl, { url: fullUrl, title });
                    }
                });
            } catch (e) {
                console.error(`❌ Butler page ${pageNum} failed:`, e);
            }
        }));

        const uniqueLinks = Array.from(allLinks.values());
        const detailPromises = uniqueLinks.map(async (item) => {
            try {
                const dRes = await fetch(item.url);
                const dHtml = await dRes.text();
                const $d = cheerio.load(dHtml);

                const titleLower = item.title.toLowerCase();
                if (titleLower.includes('season highlights') || titleLower.includes('2025-26')) return null;

                let image = $d('img[src*="utexas_image_style"]').first().attr('src') ||
                    $d('.field-name-field-image img').attr('src') ||
                    $d('article img').first().attr('src');

                if (image && !image.startsWith('http')) image = `${baseUrl}${image}`;

                let rawDate = $d('time').attr('datetime') || $d('.date-display-single').text().trim();
                const date = parseSafeDate(rawDate);

                return {
                    id: `butler-${item.url.split('/').pop()}`,
                    title: item.title,
                    date,
                    venue: 'Butler School of Music',
                    image: image || undefined,
                    link: item.url,
                    description: $d('.field-name-body').text().trim().substring(0, 150) || undefined
                };
            } catch {
                return null;
            }
        });

        const results = await Promise.all(detailPromises);
        const filtered = results.filter((e): e is Event => e !== null);

        console.log(`✅ Butler: Scraped ${filtered.length} events`);
        return filtered;
    } catch (e) {
        console.error("❌ Butler scraper failed completely:", e);
        return [];
    }
}

// --- MOODY CENTER ---
async function scrapeMoodyCenter(): Promise<Event[]> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY;

        if (!apiKey) {
            console.error('❌ MOODY: No Ticketmaster API key found! Set NEXT_PUBLIC_TICKETMASTER_API_KEY');
            return [];
        }

        console.log('🎫 Moody: Fetching from Ticketmaster API...');

        const res = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?venueId=KovZ917ANwG&size=50&apikey=${apiKey}&sort=date,asc&classificationName=music`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            console.error(`❌ MOODY: API returned ${res.status} ${res.statusText}`);
            const errorText = await res.text();
            console.error('Error details:', errorText.substring(0, 200));
            return [];
        }

        const data = await res.json() as any;
        const items = data._embedded?.events || [];

        if (items.length === 0) {
            console.warn('⚠️ MOODY: API returned 0 events');
            return [];
        }

        const filtered = items
            .filter((e: any) => {
                const n = (e.name || '').toLowerCase();
                return !n.includes('parking') && !n.includes('vip') && !n.includes('upgrade');
            })
            .map((e: any) => ({
                id: `moody-${e.id}`,
                title: e.name,
                date: e.dates?.start?.localDate || 'TBA',
                venue: 'Moody Center',
                image: e.images?.[0]?.url || undefined,
                link: e.url,
                description: e.classifications?.[0]?.genre?.name || undefined
            }));

        console.log(`✅ Moody: Got ${filtered.length} events from Ticketmaster`);
        return filtered;
    } catch (e) {
        console.error("❌ MOODY: Scraper failed:", e);
        return [];
    }
}

// --- AGGREGATOR ---
export async function fetchAllEvents(): Promise<Event[]> {
    console.log('🔄 Starting event scrape...');

    const [moody, butler] = await Promise.all([
        scrapeMoodyCenter(),
        scrapeButler()
    ]);

    console.log(`📊 TOTAL: ${moody.length} Moody + ${butler.length} Butler = ${moody.length + butler.length} events`);

    // Manual Texas Performing Arts events
    const manualEvents: Event[] = [
        // ... (all manual events unchanged)
    ];

    // Combine all events
    const all = [...moody, ...butler, ...manualEvents];

    // Filter out unwanted events
    const filtered = all.filter(event =>
        !event.title.includes('Widespread Panic: 2 Day Ticket')
    );

    console.log(`✅ FINAL: ${filtered.length} total events (${manualEvents.length} manual TPA events added)`);

    // Sort by Date
    return filtered.sort((a, b) => a.date.localeCompare(b.date));
}
