import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { prompt, category = 'wedding' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemInstruction = `You are an elite Indian graphic designer and Fabric.js canvas architect for "Indian Design Studio".
Generate an editable Fabric.js JSON canvas definition tailored to Indian design aesthetics.
Standard dimensions:
- Wedding: 1200x1800
- Poster: 1240x1754
- ID card: 1012x638
- Business card: 1050x600

Output MUST be a JSON object containing:
{
  "title": "Creative title",
  "category": "${category}",
  "width": 1200,
  "height": 1800,
  "palette": ["#580816", "#d4af37", "#fef08a", "#ffffff"],
  "canvasData": {
    "version": "5.3.0",
    "objects": [
      {
        "type": "rect",
        "left": 0,
        "top": 0,
        "width": 1200,
        "height": 1800,
        "fill": "#...",
        "selectable": false
      },
      ... other objects (rects, i-text, circles, lines)
    ]
  }
}
Every object must have type, left, top, fill, and for i-text include text, fontSize, fontFamily ('Noto Sans Devanagari', 'Rozha One', 'Cinzel', or 'Poppins'), fontWeight, originX: 'center'.
Make the design look majestic, culturally authentic, and print-ready.`;

    const res = await callGemini(
      `Generate an editable design for: ${prompt}`,
      systemInstruction,
      true
    );

    if (!res.success) {
      return NextResponse.json(
        {
          error: res.error,
          needsApiKey: res.needsApiKey,
        },
        { status: res.needsApiKey ? 403 : 500 }
      );
    }

    return NextResponse.json({ design: res.data || res.text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
