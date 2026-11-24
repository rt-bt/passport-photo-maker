/**
 * Server-side Gemini AI integration helper for Indian Design Studio
 */

export interface GeminiResponse {
  success: boolean;
  text?: string;
  data?: any;
  error?: string;
  needsApiKey?: boolean;
}

export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  jsonFormat: boolean = false
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      needsApiKey: true,
      error:
        'GEMINI_API_KEY is not configured in your environment variables (.env.local). Please set your Google Gemini API key to enable live AI generation.',
    };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    if (jsonFormat) {
      body.generationConfig = {
        responseMimeType: 'application/json',
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `Gemini API returned error (${response.status}): ${errText}`,
      };
    }

    const result = await response.json();
    const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (jsonFormat) {
      try {
        const parsed = JSON.parse(generatedText);
        return { success: true, text: generatedText, data: parsed };
      } catch (pErr) {
        return { success: true, text: generatedText, data: null };
      }
    }

    return {
      success: true,
      text: generatedText,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to connect to Google Gemini API',
    };
  }
}
