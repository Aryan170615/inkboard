import { NextRequest, NextResponse } from "next/server";

const SYSTEM = `You are an AI drawing assistant for a collaborative whiteboard.
When the user asks you to draw something, respond with ONLY a valid JSON object with a "shapes" array. No explanation, no markdown.

Each shape in "shapes" must have:
- type: "rectangle" | "ellipse" | "line" | "arrow"
- x: number
- y: number
- width: number
- height: number
- stroke: string (e.g. hex color like "#F2F0FF", "#A78BFA", "#38BDF8", "#34D399", "#FB7185")
- fill: string (e.g. "#7C5CFC33" or "transparent")
- fillStyle: "hachure" | "solid" | "none"
- strokeWidth: number (usually 2)
- roughness: number (between 1 and 2)
- opacity: number (between 0.5 and 1)
- fontSize: 24
- seed: number (random integer)

Rules:
- Center around x=500,y=350
- Use 8-18 shapes
- Output ONLY JSON with {"shapes": [...]}`;

const CANDIDATE_MODELS = [
  process.env.GROQ_MODEL,
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-20b",
  "gemma2-9b-it",
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Invalid request: Prompt is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("Missing GROQ_API_KEY in environment variables.");
      return NextResponse.json(
        { error: "Server configuration error: missing API key." },
        { status: 500 }
      );
    }

    let responseData: any = null;
    let lastError: string | null = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              temperature: 0.7,
              max_tokens: 4096,
              response_format: { type: "json_object" },
              messages: [
                {
                  role: "system",
                  content: SYSTEM,
                },
                {
                  role: "user",
                  content: `Draw: ${prompt}`,
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Model ${model} failed (${response.status}):`, errText);
          lastError = errText;
          continue;
        }

        responseData = await response.json();
        break;
      } catch (err: any) {
        console.warn(`Request failed for model ${model}:`, err.message);
        lastError = err.message;
      }
    }

    if (!responseData) {
      console.error("All AI models failed. Last error:", lastError);
      return NextResponse.json(
        { error: "Unable to generate drawing with available models." },
        { status: 502 }
      );
    }

    const raw = responseData.choices?.[0]?.message?.content ?? "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({
      shapes: Array.isArray(parsed.shapes) ? parsed.shapes : [],
    });
  } catch (err) {
    console.error("Error in ai-draw API route:", err);
    return NextResponse.json(
      { error: "Unable to generate drawing." },
      { status: 500 }
    );
  }
}