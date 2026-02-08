import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize the SDK with the key from your environment variables
// Use GEMINI_API_KEY in your .env.local
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  // 2. Immediate Guard: Check if the API key actually loaded
  if (!apiKey) {
    console.error("ERROR: GEMINI_API_KEY is not defined in .env.local");
    return new Response(
      JSON.stringify({ error: "Server configuration error: Missing API Key" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "No prompt provided" }), 
        { status: 400 }
      );
    }

    // 3. Use the confirmed model from your ListModels call
    // Using gemini-2.0-flash for speed and reliability
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
    });

    // 4. Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Return the AI response to your frontend
    return new Response(
      JSON.stringify({ text }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Provide specific feedback for common AI errors
    const errorMessage = error.message || "An error occurred during AI generation";
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}