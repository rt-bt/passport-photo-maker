import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { type, prompt, language = 'Hindi' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemInstruction = `You are a professional Indian copywriter, invitation scriptwriter, and marketing expert for "Indian Design Studio".
You specialize in writing evocative, culturally rich, and grammatically perfect text in Hindi (Devanagari script) and English.
Depending on the category (${type}):
- If wedding invitation: Write auspicious shlokas, heartfelt parent lines, elegant wedding couple wording, and RSVP lines.
- If birthday / festival: Write festive congratulations, blessings, and dates.
- If advertisement / poster: Write catchy Hindi slogans, offers, and calls-to-action (CTAs).
- If social media: Write punchy captions with relevant Indian hashtags.
Always provide high-quality, formatted outputs that can be inserted directly into graphic design templates.`;

    const userPrompt = `Category: ${type || 'general'}
Language: ${language}
User Request: ${prompt}

Please generate 3 different creative options (e.g., Option 1: Traditional/Formal, Option 2: Modern/Catchy, Option 3: Royal/Poetic). Include appropriate emojis and line breaks.`;

    const res = await callGemini(userPrompt, systemInstruction);

    if (!res.success) {
      return NextResponse.json(
        {
          error: res.error,
          needsApiKey: res.needsApiKey,
        },
        { status: res.needsApiKey ? 403 : 500 }
      );
    }

    return NextResponse.json({ text: res.text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
