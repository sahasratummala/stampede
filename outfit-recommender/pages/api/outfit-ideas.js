// pages/api/outfit-ideas.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const API_KEY = process.env.SERPAPI_KEY; 

  if (!API_KEY) {
    console.error("❌ ERROR: SERPAPI_KEY is missing.");
    return res.status(500).json({ message: "Server configuration error" });
  }

  const { artist, genre, vibe, weather } = req.body;

  // 1. STYLE MAP (Kept your vibe adjustments)
  const styleMap = {
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
  
  // 2. THE "SOFT" BAN LIST
  // Removed "-red carpet" and "-performer" to stop blocking good celebrity street style
  const negativeKeywords = "-prom -wedding -bride -costume -drawing";
  
  // 3. THE QUERY
  // Added "street style" and "aesthetic" to find real clothes
  const query = `${artist} concert outfit ${styleKeywords} street style ${negativeKeywords} -site:tiktok.com -site:lemon8-app.com`;

  console.log(`🔍 Searching: "${query}"`);

  try {
    const params = new URLSearchParams({
      engine: "google_images",
      q: query,
      api_key: API_KEY,
      num: "25" // <--- INCREASED: Fetch 25 images so we have backups if some are blocked
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    const data = await response.json();

    if (!data.images_results) {
      console.warn("⚠️ Google found 0 images.");
      return res.status(200).json({ images: [] });
    }

    // 4. THE FILTER
    // Blocks the sites that show "Permission Denied" boxes
    const validImages = data.images_results.filter(img => {
       const blockedDomains = ['tiktok.com', 'lemon8', 'douyin', 'facebook.com'];
       return !blockedDomains.some(domain => img.link.includes(domain));
    });

    console.log(`📊 Stats: Found ${data.images_results.length} total. ${validImages.length} survived the filter.`);

    // 5. RETURN
    // Return the top 8 that survived
    const images = validImages.slice(0, 8).map(img => ({
      title: img.title || "Concert Look",
      src: img.original,
      thumbnail: img.thumbnail,
      link: img.link,
      source: img.source
    }));

    return res.status(200).json({ images });

  } catch (error) {
    console.error("SerpApi Failed:", error);
    return res.status(500).json({ message: "Failed to fetch outfit ideas" });
  }
}