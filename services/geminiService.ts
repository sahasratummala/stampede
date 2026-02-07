
import { GoogleGenAI, Type } from "@google/genai";
import { OutfitSuggestion, ConcertEvent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getUpcomingEvents = async (location: 'Moody Center' | 'Butler School of Music'): Promise<{events: ConcertEvent[], grounding: any[]}> => {
  const prompt = location === 'Moody Center' 
    ? "List the next 8 major upcoming concerts and events at the Moody Center in Austin, TX for 2025. Include artist name, date, category (Concert, Sports, Comedy), and a high-quality descriptive summary."
    : "List the next 6 upcoming performances, recitals, or concerts at the Butler School of Music (UT Austin) for 2025. Include venue (e.g., Bates Recital Hall), date, and a brief description of the program.";

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
          required: ["id", "title", "artist", "date", "description", "category"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '[]');
    const events = data.map((ev: any, i: number) => ({
      ...ev,
      image: ev.image || `https://picsum.photos/800/400?random=${location === 'Moody Center' ? i + 20 : i + 40}`
    }));
    return {
      events,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e) {
    console.error("Failed to parse events", e);
    return { events: [], grounding: [] };
  }
};

export const getArtistInfo = async (artistName: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a detailed profile of the artist "${artistName}". Include their musical style, recent hits, their typical concert aesthetic, and what fans can expect from their live performance at a venue like Moody Center.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const getOutfitTrends = async (artistName: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Search for current 2025 fashion trends and fan outfit ideas for a ${artistName} concert. What are people wearing to this specific tour? Provide a summary of the 'vibe'.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const analyzeOutfit = async (imageBase64: string, artistName: string): Promise<OutfitSuggestion> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        { text: `Analyze my current outfit and suggest creative improvements for a ${artistName} concert. Cross-reference with current tour fashion trends for ${artistName}.` }
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
};
