// Change from @google-cloud/generative-ai to @google/generative-ai
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { listener, artists } = await req.json();

    const prompt = `
      You are a music discovery expert. 
      Listener Profile: "${listener.name} likes ${listener.major} and their bio is: ${listener.bio}"
      
      Available Artists:
      ${artists.map((a: any) => `ID: ${a.id}, Name: ${a.name}, Genre: ${a.genre}, Bio: ${a.bio}`).join("\n")}

      Task: Rank these Artist IDs from best match to worst match for this listener. 
      Return ONLY a JSON array of strings (the IDs), nothing else.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response in case Gemini adds markdown code blocks
    const cleanedText = text.replace(/```json|```/g, "").trim();
    const rankedIds = JSON.parse(cleanedText);

    return NextResponse.json(rankedIds);
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json([]);
  }
}