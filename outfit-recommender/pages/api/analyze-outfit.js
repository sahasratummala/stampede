import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, weather, artist, venue, genre } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use gpt-4o or gpt-4-turbo for vision
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

    const analysis = JSON.parse(response.choices[0].message.content);
    res.status(200).json(analysis);

  } catch (error) {
    console.error('OPENAI ERROR:', error);
    res.status(500).json({ error: 'Failed to analyze outfit' });
  }
}
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb', // update size limir from 1mb to 5mb
    },
  },
};