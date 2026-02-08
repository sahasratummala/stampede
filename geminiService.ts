import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.GEMINI_API_KEY directly for initialization as per @google/genai guidelines.
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const handleApiError = (e: any) => {
  if (e?.message?.includes('429') || e?.message?.includes('RESOURCE_EXHAUSTED')) {
    throw new Error('QUOTA_EXCEEDED');
  }
  throw e;
};

/**
 * Fetches real-world music events from specific UT Austin related domains.
 */
export const getUpcomingEvents = async (location: 'Moody Center' | 'Butler School of Music'): Promise<{ events: any[], grounding: any[] }> => {
  // Fallback sample data if API key is not configured
  if (!ai) {
    const sampleMoody = [
      { id: '1', title: 'Post Malone in Concert', artist: 'Post Malone', date: 'Feb 15, 2025', description: 'Chart-topping hits and new releases. A high-energy performance of Post Malone\'s biggest songs from across his career.', category: 'Concert', image: 'https://picsum.photos/800/400?random=101' },
      { id: '2', title: 'Travis Scott Live', artist: 'Travis Scott', date: 'Mar 1, 2025', description: 'Hip-hop and trap music showcase. Experience the production and energy that made Travis Scott a global phenomenon.', category: 'Concert', image: 'https://picsum.photos/800/400?random=102' },
      { id: '3', title: 'SZA Tour Stop', artist: 'SZA', date: 'Mar 20, 2025', description: 'R&B and soul performance featuring hits from her album. A mesmerizing show from one of music\'s brightest stars.', category: 'Concert', image: 'https://picsum.photos/800/400?random=103' },
      { id: '4', title: 'The Weeknd Experience', artist: 'The Weeknd', date: 'Apr 10, 2025', description: 'Electronic and pop music extravaganza. The Weeknd brings his signature dark sound and spectacular production.', category: 'Concert', image: 'https://picsum.photos/800/400?random=104' }
    ];
    const sampleButler = [
      { id: '5', title: 'UT Symphony Orchestra', artist: 'UT Symphony Orchestra', date: 'Feb 20, 2025', description: 'Classical masterpieces performed by UT\'s premier ensemble. A showcase of classical excellence featuring works from renowned composers.', category: 'Classical/Jazz', image: 'https://picsum.photos/800/400?random=201' },
      { id: '6', title: 'Jazz Ensemble Recital', artist: 'UT Jazz Ensemble', date: 'Mar 10, 2025', description: 'Contemporary and traditional jazz performances. Experience the improvisation and creativity of UT\'s award-winning jazz program.', category: 'Classical/Jazz', image: 'https://picsum.photos/800/400?random=202' },
      { id: '7', title: 'Piano Recital Series', artist: 'Faculty Piano Recital', date: 'Mar 25, 2025', description: 'Featuring world-class pianists in intimate settings. Witness virtuosic performances in the beautiful Bates Recital Hall.', category: 'Classical/Jazz', image: 'https://picsum.photos/800/400?random=203' },
      { id: '8', title: 'Chamber Music Ensemble', artist: 'UT Chamber Ensemble', date: 'Apr 5, 2025', description: 'Intimate performances of chamber classics. Small ensemble performances showcasing the finest chamber music repertoire.', category: 'Classical/Jazz', image: 'https://picsum.photos/800/400?random=204' }
    ];
    return {
      events: location === 'Moody Center' ? sampleMoody : sampleButler,
      grounding: []
    };
  }

  const url = location === 'Moody Center'
    ? "https://moodycenteratx.com/events/category/music/"
    : "https://music.utexas.edu/";

  const prompt = `Search ${url} and list the next 10 upcoming music-related events. 
    For each event, provide: 
    - A unique ID
    - Event Title (Artist or Performance name)
    - Date and Time
    - A brief 2-sentence description of the music style
    - The category ('Concert' for Moody, 'Classical/Jazz' for Butler)
    - An image URL (if available, otherwise leave empty).
    
    Return the data as a JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              image: { type: Type.STRING }
            },
            required: ["id", "title", "date", "description", "category"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    const events = data.map((ev: any, i: number) => ({
      ...ev,
      artist: ev.artist || ev.title, // Fallback title to artist
      image: ev.image || `https://picsum.photos/800/400?random=${location === 'Moody Center' ? i + 100 : i + 200}`
    }));
    return {
      events,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e) {
    return handleApiError(e);
  }
};

/**
 * Specifically returns a simplified list of event names for dropdowns.
 */
export const getAllEventNames = async (): Promise<string[]> => {
  try {
    const [moody, butler] = await Promise.all([
      getUpcomingEvents('Moody Center'),
      getUpcomingEvents('Butler School of Music')
    ]);

    const moodyNames = moody.events.map(e => `${e.artist} @ Moody`);
    const butlerNames = butler.events.map(e => `${e.artist} @ Butler`);

    return [...moodyNames, ...butlerNames];
  } catch (e) {
    // Fallback if API fails
    return [
      "Billie Eilish @ Moody",
      "Travis Scott @ Moody",
      "SZA @ Moody",
      "Symphony Orchestra @ Butler",
      "Jazz Combo Recital @ Butler",
      "Bates Recital Hall Piano Series @ Butler"
    ];
  }
};

export const getArtistInfo = async (artistName: string) => {
  // Fallback artist info if API key is not configured
  if (!ai) {
    const sampleInfo: { [key: string]: string } = {
      'Post Malone': 'Post Malone is an American rapper, singer, and songwriter known for his genre-blending style combining hip-hop, pop, and rock elements. He\'s famous for hits like "Circles," "Congratulations," and "Psycho." In live performance, Post Malone is known for his energetic stage presence and engaging interactions with fans. His concerts feature both high-production visuals and intimate moments with the audience.',
      'Travis Scott': 'Travis Scott is a rapper and producer known for his atmospheric production style and hits like "Sicko Mode" and "Astroworld." Live, he\'s known for creating immersive experiences with elaborate stage designs and pyrotechnics. His concerts are high-energy celebrations of hip-hop with unexpected collaborations and surprises.',
      'SZA': 'SZA is an R&B and soul artist celebrated for her smooth vocals and hit songs like "Good Days" and "The Weekend." Known for her artistic visuals and emotional performances, SZA creates intimate yet powerful concert experiences. Her shows blend modern production with soulful performances that connect deeply with audiences.',
      'default': 'This artist is known for creating memorable live performances that bring their studio music to life with dynamic stage presence and impressive production values. Their concerts typically feature their chart-topping hits alongside deeper cuts that showcase their artistry and connection with fans.'
    };
    return {
      text: sampleInfo[artistName] || sampleInfo['default'],
      sources: []
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a detailed profile of the artist or music group "${artistName}". Include their musical style, recent hits, their typical concert aesthetic, and what fans can expect from their live performance.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e) {
    return handleApiError(e);
  }
};

export const getOutfitTrends = async (artistName: string) => {
  if (!ai) {
    return {
      text: `For a ${artistName} concert, embrace style that reflects the energy of the music. Look for trendy, comfortable pieces that let you move and dance. Consider the venue vibe: upscale casual for some artists, streetwear and sneakers for others. Most importantly, wear something that makes you feel confident and connects with the music!`,
      sources: []
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for current 2025 fashion trends for ${artistName} concert fans. What is the dress code vibe?`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e) {
    return handleApiError(e);
  }
};

export const analyzeOutfit = async (imageBase64: string, artistName: string): Promise<any> => {
  if (!ai) {
    return {
      vibe: "Concert Ready",
      description: `Your outfit has great concert vibes! For a ${artistName} show, you're definitely bringing the energy.`,
      items: ["Great shoes for dancing", "Comfortable but stylish top", "Perfect concert energy"],
      tips: "Make sure you can move and dance! This look works great for a concert."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: `Analyze my current outfit and suggest creative improvements for a ${artistName} concert.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vibe: { type: Type.STRING },
            description: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            tips: { type: Type.STRING }
          },
          required: ["vibe", "description", "items", "tips"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    return handleApiError(e);
  }
};

/**
 * Generates an AI-powered chatbot response from a concert buddy based on context.
 */
export const generateBuddyResponse = async (
  userMessage: string,
  buddyProfile: any,
  userProfile: any,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> => {
  // Fallback responses if API is not configured
  if (!ai) {
    const fallbacks = [
      "That sounds amazing! 🎵",
      "Yeah, I'm hyped too!",
      "Dude, so down for that",
      "Hook 'em! 🤘",
      "Facts facts facts",
      "Let's do it! This is gonna be fire!",
      "I'm so ready for this"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  try {
    const conversationContext = conversationHistory
      .slice(-4) // Keep last 4 messages for context
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Buddy'}: ${msg.content}`)
      .join('\n');

    const prompt = `You are a friendly concert-going college student at UT Austin. You're chatting with another student about attending a concert together.

BUDDY PROFILE:
- Name: ${buddyProfile.name}
- Major: ${buddyProfile.major}
- Concert Mood: ${buddyProfile.concertMood || 'Not specified'}
- Top Artists: ${buddyProfile.topArtists.join(', ')}
- Interests: ${buddyProfile.interests.join(', ')}
- Attending: ${buddyProfile.attendingEvent}
- Bio: ${buddyProfile.bio}

THE OTHER PERSON:
- Name: ${userProfile.name}
- Major: ${userProfile.major}
- Top Artists: ${userProfile.topArtists.join(', ')}
- Interests: ${userProfile.interests.join(', ')}

RECENT CONVERSATION:
${conversationContext}

USER JUST SAID: "${userMessage}"

Generate ONE natural, enthusiastic response (1-2 sentences max) from ${buddyProfile.name}'s perspective. 
Be authentic to their personality, reference shared interests if relevant, and keep it conversational like a real college student texting.
Do NOT include any labels, quotes, or formatting - just the raw message text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    const text = response.text?.trim() || "That sounds awesome! Let's meet up!";
    return text;
  } catch (e) {
    // Fallback responses if API fails
    const fallbacks = [
      "That sounds amazing! 🎵",
      "Yeah, I'm hyped too!",
      "Dude, so down for that",
      "Hook 'em! 🤘",
      "Facts facts facts"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};