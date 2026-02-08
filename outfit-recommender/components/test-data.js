// test-data.js
// Sample data for testing the outfit recommender

export const sampleEvents = [
  {
    id: 1,
    artist: "Taylor Swift",
    venue: "Moody Center",
    date: "2026-03-15T19:30:00Z",
    time: "7:30 PM",
    genre: "pop",
    image: "/images/taylor-swift.jpg",
    description: "The Eras Tour brings Taylor Swift to Austin for an unforgettable night of hits spanning her entire career.",
    priceRange: "$49 - $449",
    status: "On Sale"
  },
  {
    id: 2,
    artist: "Bad Bunny",
    venue: "Moody Center",
    date: "2026-04-22T20:00:00Z",
    time: "8:00 PM",
    genre: "reggaeton",
    image: "/images/bad-bunny.jpg",
    description: "El conejo malo returns to Austin! Get ready for a high-energy night of reggaeton and Latin trap.",
    priceRange: "$65 - $350",
    status: "Selling Fast"
  },
  {
    id: 3,
    artist: "Tame Impala",
    venue: "Moody Center",
    date: "2026-05-10T19:00:00Z",
    time: "7:00 PM",
    genre: "psychedelic rock",
    image: "/images/tame-impala.jpg",
    description: "Experience the mind-bending psychedelic sounds of Tame Impala live with stunning visuals.",
    priceRange: "$55 - $175",
    status: "On Sale"
  }
];

export const sampleArtistInfo = {
  "Taylor Swift": {
    name: "Taylor Swift",
    genre: "pop",
    description: "Taylor Swift is an American singer-songwriter known for narrative songs about her personal life, which have received widespread media coverage and critical praise.",
    concertStyle: [
      "The Eras Tour is known for its elaborate costumes and sparkly, glamorous aesthetic",
      "Fans often dress in era-specific outfits representing different Taylor Swift albums",
      "Friendship bracelets and rhinestones are signature accessories"
    ],
    recommendations: {
      styling: [
        "Sparkly or sequined pieces",
        "Era-themed outfit (pick your favorite album)",
        "Friendship bracelets to trade",
        "Comfortable shoes (3+ hour show)"
      ],
      vibeMatch: ["Glamorous", "Nostalgic", "Photo-ready"],
      universalTips: [
        "Make friendship bracelets to trade",
        "Dress for your favorite era",
        "Prepare for lots of dancing and singing"
      ]
    }
  },
  "Bad Bunny": {
    name: "Bad Bunny",
    genre: "reggaeton",
    description: "Bad Bunny is a Puerto Rican rapper and singer known for his Latin trap and reggaeton music.",
    concertStyle: [
      "High-energy concerts with vibrant, bold fashion",
      "Streetwear and designer pieces are common",
      "Bright colors and statement accessories"
    ],
    recommendations: {
      styling: [
        "Streetwear brands",
        "Fresh sneakers",
        "Bold colors",
        "Statement accessories"
      ],
      vibeMatch: ["Urban", "High-energy", "Confident"],
      universalTips: [
        "Comfortable for dancing all night",
        "Bold colors match the vibe",
        "Express yourself!"
      ]
    }
  }
};

export const sampleWeatherData = {
  temp: 78,
  feelsLike: 82,
  condition: "Clear",
  description: "clear sky",
  humidity: 65,
  windSpeed: 8,
  outfitTips: [
    "Perfect Austin weather! Light layers work best",
    "Indoor venue will be cooler than outside",
    "High humidity - choose moisture-wicking fabrics"
  ]
};

export const sampleOutfitAnalysis = {
  rating: 4,
  overallFeedback: "Your outfit is concert-ready! Great balance of style and comfort with room for a few tweaks.",
  whatWorks: [
    "Love the breathable fabric choice - perfect for dancing",
    "Colors are vibrant and match the energy",
    "Comfortable sneakers are clutch for a long show"
  ],
  suggestions: [
    "Add a light denim jacket for the AC inside Moody Center",
    "Consider a small crossbody bag to keep hands free",
    "Maybe swap to moisture-wicking fabric for the top"
  ],
  weatherTips: "It's 78°F and humid outside, but Moody Center blasts AC. That jacket will come in handy! The breathable fabrics you chose are perfect for Austin's climate.",
  artistTips: "This style is perfect for a pop concert! The fun, energetic vibe matches Taylor Swift's aesthetic. Consider adding some sparkle or sequins to really fit the Eras Tour theme.",
  generalIdeas: [
    {
      title: "Sparkle & Shine",
      description: "Sequined top with high-waisted jeans and platform boots"
    },
    {
      title: "Era-Themed",
      description: "Folklore-inspired cardigan with flowing dress and boots"
    },
    {
      title: "Streetwear Chic",
      description: "Oversized tour tee, bike shorts, and chunky sneakers"
    },
    {
      title: "Austin Cool",
      description: "Vintage graphic tee, denim shorts, and cowboy boots"
    }
  ]
};

export const sampleOutfitIdeas = {
  images: [
    {
      url: "https://example.com/outfit1.jpg",
      title: "Pop Concert Outfit 1",
      source: "Pinterest"
    },
    {
      url: "https://example.com/outfit2.jpg",
      title: "Concert Style Inspiration",
      source: "Instagram"
    }
  ],
  guides: [
    {
      title: "What to Wear to a Pop Concert in 2024",
      snippet: "From sparkly tops to comfortable sneakers, here's your complete guide...",
      link: "https://example.com/guide1"
    }
  ],
  recommendations: [
    "Comfortable shoes (you'll be standing!)",
    "Breathable, light fabrics",
    "Bring a light jacket for AC",
    "Small bag or pockets for essentials"
  ]
};

// Mock API response functions for testing
export function mockAnalyzeOutfit(imageData, event, weather) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleOutfitAnalysis);
    }, 2000); // Simulate API delay
  });
}

export function mockFetchWeather() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleWeatherData);
    }, 500);
  });
}

export function mockFetchOutfitIdeas(genre, vibe) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleOutfitIdeas);
    }, 1000);
  });
}

export function mockFetchArtistInfo(artistName) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleArtistInfo[artistName] || {
        name: artistName,
        genre: "music",
        description: `${artistName} is performing at Moody Center!`,
        recommendations: {
          styling: ["Be comfortable", "Express yourself"],
          vibeMatch: ["Concert-ready"]
        }
      });
    }, 800);
  });
}
