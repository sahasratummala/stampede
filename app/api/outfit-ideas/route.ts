import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const API_KEY = process.env.SERPAPI_KEY; 

    if (!API_KEY) {
      console.error("❌ ERROR: SERPAPI_KEY is missing.");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    // 1. GET DATA (App Router way)
    const body = await req.json();
    const { artist, genre, vibe, weather } = body;

    // 2. STYLE MAP (Your logic preserved)
    const styleMap: Record<string, string> = {
      'jazz': 'chic smart casual outfit, trousers, speakeasy aesthetic',
      'classical': 'business casual, elegant modest outfit, theatre',
      'rock': 'edgy street style, leather, band tee, boots',
      'pop': 'trendy concert outfit, sequin skirt, eras tour vibe',
      'country': 'western chic, denim, cowboy boots, nashville',
      'rap': 'streetwear, cargo pants, oversized tee, sneakers',
      'indie': 'retro outfit, 90s fashion, corduroy, doc martens'
    };

    const genreLower = genre?.toLowerCase() || '';
    const styleKeywords = styleMap[genreLower] || `${vibe || 'concert'} outfit trends`;
    
    // 3. THE "SOFT" BAN LIST
    const negativeKeywords = "-prom -wedding -bride -costume -drawing";
    
    // 4. THE QUERY
    const query = `${artist} concert outfit ${styleKeywords} street style ${negativeKeywords} -site:tiktok.com -site:lemon8-app.com`;

    console.log(`🔍 Searching: "${query}"`);

    // 5. FETCH FROM SERPAPI
    const params = new URLSearchParams({
      engine: "google_images",
      q: query,
      api_key: API_KEY,
      num: "25" // Fetching 25 to have backups
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    const data = await response.json();

    if (!data.images_results) {
      console.warn("⚠️ Google found 0 images.");
      return NextResponse.json({ images: [] });
    }

    // 6. THE FILTER
    // Blocks sites that often block hotlinking or show permission errors
    const validImages = data.images_results.filter((img: any) => {
       const blockedDomains = ['tiktok.com', 'lemon8', 'douyin', 'facebook.com'];
       return !blockedDomains.some(domain => img.link.includes(domain));
    });

    console.log(`📊 Stats: Found ${data.images_results.length} total. ${validImages.length} survived the filter.`);

    // 7. RETURN TOP 8
    const images = validImages.slice(0, 8).map((img: any) => ({
      title: img.title || "Concert Look",
      src: img.original,
      thumbnail: img.thumbnail,
      link: img.link,
      source: img.source
    }));

    return NextResponse.json({ images });

  } catch (error) {
    console.error("SerpApi Failed:", error);
    return NextResponse.json({ message: "Failed to fetch outfit ideas" }, { status: 500 });
  }
}