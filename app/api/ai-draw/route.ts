import { NextRequest, NextResponse } from "next/server";

const SYSTEM = `You are an AI drawing assistant for a collaborative whiteboard.
When the user asks you to draw something, respond with ONLY a valid JSON object with a "shapes" array. No explanation, no markdown.

Each shape has:
- type: "rectangle" | "ellipse" | "line" | "arrow"
- x
- y
- width
- height
- stroke
- fill
- fillStyle
- strokeWidth
- roughness
- opacity
- fontSize
- seed

Rules:
- Center around x=500,y=350
- Use 8-18 shapes
- Output ONLY JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("Missing GROQ_API_KEY");
      return NextResponse.json(
        { error: "Server error" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens: 4096,
          messages: [
            {
              role: "system",
              content: SYSTEM,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error(await response.text());

      return NextResponse.json(
        {
          error: "Unable to generate drawing.",
        },
        {
          status: 502,
        }
      );
    }

    const data = await response.json();

    const raw =
      data.choices?.[0]?.message?.content ?? "{}";

    const clean = raw.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(clean);

    return NextResponse.json({
      shapes: Array.isArray(parsed.shapes)
        ? parsed.shapes
        : [],
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Unable to generate drawing.",
      },
      {
        status: 500,
      }
    );
  }
}