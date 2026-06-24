import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function callGemini(prompt: string, responseSchema?: any) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in the backend environment .env file. Please add your key to proceed.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const body: any = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  if (responseSchema) {
    body.generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: responseSchema
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No content returned from Gemini.');
  }

  return responseSchema ? JSON.parse(text) : text;
}
