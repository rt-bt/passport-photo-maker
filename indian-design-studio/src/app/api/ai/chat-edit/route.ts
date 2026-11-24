import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { instruction, currentCanvas } = await req.json();

    if (!instruction) {
      return NextResponse.json({ error: 'Instruction is required' }, { status: 400 });
    }

    const systemInstruction = `You are an AI Design Assistant for Indian Design Studio.
Given the current Fabric.js JSON objects and a user modification request (e.g., "Change the background to royal navy blue and make the font gold", "Add Ganesh mantra at the top"),
modify the JSON objects appropriately and return the updated JSON:
{
  "summary": "Brief summary of changes made",
  "objects": [ ... updated fabric objects ... ]
}`;

    const res = await callGemini(
      `Instruction: ${instruction}\nCurrent Canvas Data: ${JSON.stringify(currentCanvas?.objects || [])}`,
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

    return NextResponse.json({ result: res.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
