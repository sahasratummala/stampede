
import { GoogleGenAI, Type } from "@google/genai";
import { OutfitSuggestion, ConcertEvent } from "../types";

// Always use process.env.GEMINI_API_KEY directly for initialization as per @google/genai guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const handleApiError = (e: any) => {
  if (e?.message?.includes('429') || e?.message?.includes('RESOURCE_EXHAUSTED')) {
    throw new Error('QUOTA_EXCEEDED');
  }
  throw e;
};

/**
 * Fetches real-world music events from specific UT Austin related domains.
 */
export const getUpcomingEvents = async (location: 'Moody Center' | 'Butler School of Music'): Promise<{ events: ConcertEvent[], grounding: any[] }> => {
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

export const analyzeOutfit = async (imageBase64: string, artistName: string): Promise<OutfitSuggestion> => {
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
