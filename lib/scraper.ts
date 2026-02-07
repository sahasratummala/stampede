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
    // Scrape Page 0, 1, 2, 3 to ensure we get future months
    const pages = [0, 1, 2, 3];
    const allLinks = new Map<string, { url: string, title: string }>();

    try {
        // 1. Fetch all pages in parallel
        await Promise.all(pages.map(async (pageNum) => {
            try {
                const res = await fetch(`${baseUrl}/events?page=${pageNum}`, {
                    next: { revalidate: 3600 } // Cache for 1 hour
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
                console.error(`Failed to scrape Butler page ${pageNum}`);
            }
        }));

        // 2. Scrape details for each unique link
        const uniqueLinks = Array.from(allLinks.values());
        const detailPromises = uniqueLinks.map(async (item) => {
            try {
                const dRes = await fetch(item.url);
                const dHtml = await dRes.text();
                const $d = cheerio.load(dHtml);

                // Filter out "Season Highlights" or generic pages
                const titleLower = item.title.toLowerCase();
                if (titleLower.includes('season highlights') || titleLower.includes('2025-26')) return null;

                // Image Selector: Prioritize the high-res UT style
                let image = $d('img[src*="utexas_image_style"]').first().attr('src') ||
                    $d('.field-name-field-image img').attr('src') ||
                    $d('article img').first().attr('src');

                if (image && !image.startsWith('http')) image = `${baseUrl}${image}`;

                // Date Extraction
                let rawDate = $d('time').attr('datetime') || $d('.date-display-single').text().trim();
                const date = parseSafeDate(rawDate);

                return {
                    id: `butler-${item.url.split('/').pop()}`,
                    title: item.title,
                    date,
                    venue: 'Butler School of Music',
                    image,
                    link: item.url,
                    description: $d('.field-name-body').text().trim().substring(0, 150)
                };
            } catch {
                return null;
            }
        });

        const results = await Promise.all(detailPromises);
        return results.filter((e): e is Event => e !== null);
    } catch (e) {
        console.error("Butler Scraper Failed completely", e);
        return [];
    }
}

// --- MOODY CENTER ---
async function scrapeMoodyCenter(): Promise<Event[]> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY;
        if (!apiKey) return [];

        const res = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?venueId=KovZ917ANwG&size=50&apikey=${apiKey}&sort=date,asc&classificationName=music`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) return [];

        const data = await res.json() as any;
        const items = data._embedded?.events || [];

        return items
            .filter((e: any) => {
                const n = (e.name || '').toLowerCase();
                return !n.includes('parking') && !n.includes('vip') && !n.includes('upgrade');
            })
            .map((e: any) => ({
                id: `moody-${e.id}`,
                title: e.name,
                date: e.dates?.start?.localDate || 'TBA',
                venue: 'Moody Center',
                image: e.images?.[0]?.url,
                link: e.url,
                description: e.classifications?.[0]?.genre?.name
            }));
    } catch (e) {
        console.error("Moody Scraper Failed", e);
        return [];
    }
}

// --- AGGREGATOR ---
export async function fetchAllEvents(): Promise<Event[]> {
    const [moody, butler] = await Promise.all([scrapeMoodyCenter(), scrapeButler()]);
    const all = [...moody, ...butler];

    // Sort by Date
    return all.sort((a, b) => a.date.localeCompare(b.date));
}