import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. GET DATA (App Router way)
    const body = await req.json();
    const { image, weather, artist, venue, genre } = body;

    // Safety check for API Key
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ ERROR: OPENAI_API_KEY is missing.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 2. CALL OPENAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content: `You are a trendy, honest, and helpful fashion stylist for college students in Austin, Texas. 
          Your goal is to judge outfits based on three factors:
          1. **The Event:** Is it suitable for a ${artist} (${genre}) concert at ${venue}?
          2. **The Weather:** Is it practical for ${weather?.temp}°F and ${weather?.condition}? (Crucial!)
          3. **The Style:** Does it look good?

          Output must be valid JSON with this structure:
          {
            "rating": (number 1-5),
            "weatherVerdict": "A short, punchy sentence specifically about if they will be hot/cold/wet based on the weather.",
            "overallFeedback": "2 sentences summarizing the vibe.",
            "whatWorks": ["Point 1", "Point 2"],
            "suggestions": ["Point 1", "Point 2"]
          }`
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this outfit for a ${artist} concert. The weather is ${weather?.temp}°F and ${weather?.condition}.` },
            { type: "image_url", image_url: { url: image } }
          ],
        },
      ],
      max_tokens: 500,
      response_format: { type: "json_object" }
    });


    // 3. RETURN RESULT
    const content = response.choices[0].message.content || "{}";
    const analysis = JSON.parse(content);
    
    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('OPENAI ERROR:', error);
    return NextResponse.json({ error: 'Failed to analyze outfit' }, { status: 500 });
  }
}