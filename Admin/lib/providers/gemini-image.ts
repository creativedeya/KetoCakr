import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

interface GenerateImageInput {
  prompt: string;
  referenceImageUrl?: string;
  equipmentImages?: string[];
}

interface GenerateImageOutput {
  base64: string;
  mimeType: string;
  provider: "gemini";
}

const translationCache: Map<string, string> = new Map();

export async function translatePrompt(prompt: string): Promise<string> {
  if (translationCache.has(prompt)) {
    return translationCache.get(prompt)!;
  }

  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length === 0 || trimmedPrompt.length < 20) {
    translationCache.set(prompt, prompt);
    return prompt;
  }

  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
  try {
    const response = await model.generateContent(`
Translate the following text to English for a food photography image generation prompt.
Maintain all technical details about utensils and textures.

Text:
${prompt}
    `);

    const translated = response.response.text() || prompt;
    translationCache.set(prompt, translated);
    return translated;
  } catch (error: any) {
    console.warn("Translation failed, using original prompt:", error);
    return prompt;
  }
}

export async function generateImageWithGemini(
  input: GenerateImageInput
): Promise<GenerateImageOutput> {
  const { prompt, referenceImageUrl, equipmentImages = [] } = input;

  const translatedPrompt = await translatePrompt(prompt);

  const contentParts: any[] = [];

  // When using reference image, put it FIRST as the PRIMARY visual foundation
  if (referenceImageUrl) {
    try {
      const response = await fetch(referenceImageUrl);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = response.headers.get("content-type") || "image/jpeg";
      contentParts.push({ inlineData: { data: base64, mimeType } });
      console.log(`🖼️ Reference image loaded (PRIMARY): ${referenceImageUrl.split('/').pop()}`);
    } catch (error) {
      console.warn("Could not fetch reference image:", referenceImageUrl);
    }
  }

  // Equipment reference images go second (supporting visuals)
  for (const equipUrl of equipmentImages) {
    try {
      const response = await fetch(equipUrl);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = response.headers.get("content-type") || "image/jpeg";
      contentParts.push({ inlineData: { data: base64, mimeType } });
      console.log(`🔧 Equipment ref loaded: ${equipUrl.split('/').pop()}`);
    } catch (error) {
      console.warn("Could not fetch equipment image:", equipUrl);
    }
  }

  const equipmentInstruction = equipmentImages.length > 0
    ? "\n\nEQUIPMENT REFERENCES: The images attached show the exact equipment/utensils to use. Reproduce them with IDENTICAL visual appearance — same color, shape, brand, and design."
    : "";

  contentParts.push({ text: translatedPrompt + equipmentInstruction });

  // Use direct fetch to avoid SDK Content-Type bug with inlineData
  const apiKey = process.env.GOOGLE_API_KEY || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

  const fetchResponse = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: contentParts }],
      generationConfig: {
        responseModalities: ["Text", "Image"],
        temperature: 1,
      },
    }),
  });

  if (!fetchResponse.ok) {
    const errorText = await fetchResponse.text();
    let errorMsg: string;
    try { errorMsg = JSON.parse(errorText)?.error?.message || errorText; }
    catch { errorMsg = errorText; }
    throw new Error(`Gemini API error ${fetchResponse.status}: ${errorMsg}`);
  }

  const responseData = await fetchResponse.json();
  const parts = responseData?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    const textPart = parts.find((p: any) => p.text);
    const finishReason = responseData?.candidates?.[0]?.finishReason;
    console.error('[Gemini] No image data. finishReason:', finishReason);
    if (textPart?.text) console.error('[Gemini] Text:', textPart.text.slice(0, 300));
    throw new Error(`No image data from Gemini. finishReason=${finishReason}`);
  }

  return {
    base64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || "image/png",
    provider: "gemini",
  };
}
