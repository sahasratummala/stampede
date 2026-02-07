// api/artist-info.js
import axios from 'axios';

const SERPAPI_KEY = process.env.SERPAPI_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artistName } = req.body;

  if (!artistName) {
    return res.status(400).json({ error: 'Artist name is required' });
  }

  try {
    // Search for artist information using Google Knowledge Graph
    const kgResponse = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google',
        q: `${artistName} artist music genre`,
        api_key: SERPAPI_KEY,
        num: 1
      }
    });

    // Get artist's typical concert aesthetic/vibe
    const vibeResponse = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google',
        q: `${artistName} concert style aesthetic fashion`,
        api_key: SERPAPI_KEY,
        num: 5
      }
    });

    // Get concert images for visual reference
    const imageResponse = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_images',
        q: `${artistName} concert crowd outfit`,
        api_key: SERPAPI_KEY,
        num: 8,
        safe: 'active'
      }
    });

    // Extract knowledge graph data
    const knowledgeGraph = kgResponse.data.knowledge_graph || {};
    
    const artistInfo = {
      name: knowledgeGraph.title || artistName,
      genre: knowledgeGraph.genre || extractGenreFromSnippets(vibeResponse.data),
      description: knowledgeGraph.description || '',
      image: knowledgeGraph.image || '',
      
      // Concert vibe info
      concertStyle: extractConcertStyle(vibeResponse.data),
      typicalOutfits: extractOutfitDescriptions(vibeResponse.data),
      
      // Visual references
      concertImages: imageResponse.data.images_results?.slice(0, 6).map(img => ({
        url: img.thumbnail,
        title: img.title,
        source: img.source
      })) || [],
      
      // Styling recommendations
      recommendations: generateArtistRecommendations(
        knowledgeGraph.genre || extractGenreFromSnippets(vibeResponse.data),
        artistName
      )
    };

    res.status(200).json(artistInfo);
  } catch (error) {
    console.error('Artist Info API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch artist information',
      details: error.message
    });
  }
}

// Helper functions
function extractGenreFromSnippets(searchData) {
  const genres = ['pop', 'rock', 'hip hop', 'rap', 'country', 'r&b', 'indie', 
                  'electronic', 'jazz', 'metal', 'alternative', 'folk'];
  
  const snippets = searchData.organic_results?.map(r => 
    `${r.title} ${r.snippet}`.toLowerCase()
  ).join(' ') || '';

  const foundGenres = genres.filter(genre => snippets.includes(genre));
  return foundGenres[0] || 'music';
}

function extractConcertStyle(searchData) {
  const results = searchData.organic_results || [];
  const descriptions = [];

  results.forEach(result => {
    if (result.snippet) {
      descriptions.push(result.snippet);
    }
  });

  return descriptions.slice(0, 3);
}

function extractOutfitDescriptions(searchData) {
  const results = searchData.organic_results || [];
  const outfitKeywords = ['wear', 'outfit', 'style', 'fashion', 'dress', 'clothing'];
  const outfitDescriptions = [];

  results.forEach(result => {
    const snippet = result.snippet?.toLowerCase() || '';
    if (outfitKeywords.some(keyword => snippet.includes(keyword))) {
      outfitDescriptions.push({
        source: result.title,
        description: result.snippet,
        link: result.link
      });
    }
  });

  return outfitDescriptions.slice(0, 5);
}

function generateArtistRecommendations(genre, artistName) {
  const recommendations = {
    genre: genre,
    artist: artistName,
    styling: [],
    vibeMatch: []
  };

  // Genre-based recommendations
  const genreStyles = {
    'pop': {
      styling: ['Trendy and colorful', 'Statement pieces', 'Fun accessories', 'Bold makeup/hair'],
      vibe: ['High energy', 'Glam', 'Photo-ready']
    },
    'rock': {
      styling: ['Band tees', 'Leather or denim', 'Edgy accessories', 'Dark colors'],
      vibe: ['Rebellious', 'Casual-cool', 'Authentic']
    },
    'hip hop': {
      styling: ['Streetwear brands', 'Fresh sneakers', 'Designer pieces', 'Chains/jewelry'],
      vibe: ['Urban', 'Confident', 'Statement-making']
    },
    'rap': {
      styling: ['Streetwear brands', 'Fresh sneakers', 'Designer pieces', 'Chains/jewelry'],
      vibe: ['Urban', 'Confident', 'Statement-making']
    },
    'country': {
      styling: ['Denim', 'Boots', 'Western details', 'Casual layers'],
      vibe: ['Authentic', 'Comfortable', 'Down-to-earth']
    },
    'indie': {
      styling: ['Vintage pieces', 'Thrifted finds', 'Unique accessories', 'Artistic flair'],
      vibe: ['Creative', 'Authentic', 'Non-conformist']
    },
    'electronic': {
      styling: ['Comfortable rave-wear', 'Neon/reflective', 'Breathable fabrics', 'Functional'],
      vibe: ['High-energy', 'Futuristic', 'Free-spirited']
    }
  };

  // Find matching genre style
  const genreKey = Object.keys(genreStyles).find(key => 
    genre.toLowerCase().includes(key)
  );

  if (genreKey) {
    recommendations.styling = genreStyles[genreKey].styling;
    recommendations.vibeMatch = genreStyles[genreKey].vibe;
  } else {
    recommendations.styling = ['Match the artist\'s aesthetic', 'Be comfortable', 'Express yourself'];
    recommendations.vibeMatch = ['Authentic', 'Comfortable', 'Concert-ready'];
  }

  // Universal concert tips
  recommendations.universalTips = [
    'Comfortable shoes are a must',
    'Small bag or secure pockets',
    'Layer for temperature changes',
    'Avoid anything too restrictive',
    'Consider the photo ops!'
  ];

  return recommendations;
}
