// =====================================================
// Gemini 2.5 Flash Image Generator  
// Using Google AI Studio API for image generation
// =====================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System instructions for consistent Emma's Cake Studio style
const SYSTEM_INSTRUCTION = `
You are a professional food photographer specializing in Emma's Cake Studio aesthetic.

Style requirements:
- Photorealistic food photography (NOT illustrations)
- Clean, minimal, professional compositions
- Natural lighting with soft shadows
- White marble or light wooden surfaces
- Focus on food and cooking process
- High-end food magazine quality
- Sharp focus, appropriate depth of field
- No text, numbers, or labels visible
- Realistic colors, not oversaturated

Generate images that look like professional cookbook photography.
`;

/**
 * Generate image using Gemini 2.5 Flash Image
 */
export async function generateImage(prompt, options = {}) {
  try {
    console.log('🎨 Generating image with Gemini 2.5 Flash...');
    console.log('📝 Prompt:', prompt.substring(0, 100) + '...');

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: `Generate professional food photography:\n\n${prompt}` }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
      },
    });

    const response = await result.response;
    
    console.log('🔍 Debug - Response structure:', JSON.stringify({
      hasCandidates: !!response.candidates,
      candidatesLength: response.candidates?.length,
      firstCandidate: response.candidates?.[0] ? 'exists' : 'missing',
      hasContent: !!response.candidates?.[0]?.content,
      hasParts: !!response.candidates?.[0]?.content?.parts,
      partsLength: response.candidates?.[0]?.content?.parts?.length,
    }, null, 2));

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No candidates in response');
    }

    const candidate = response.candidates[0];
    
    if (!candidate.content || !candidate.content.parts) {
      throw new Error('No content.parts in candidate');
    }

    // Extract image from response
    const parts = candidate.content.parts;
    console.log(`📦 Found ${parts.length} parts in response`);
    
    let imagePart = null;
    for (const part of parts) {
      console.log('🔍 Part type:', Object.keys(part));
      if (part.inlineData) {
        imagePart = part;
        break;
      }
    }
    
    if (!imagePart || !imagePart.inlineData || !imagePart.inlineData.data) {
      // Maybe it's text-only response?
      console.log('📄 Response text:', parts[0]?.text?.substring(0, 200));
      throw new Error('No image data in response - model may not support image generation');
    }

    const imageData = {
      base64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || 'image/png',
      buffer: Buffer.from(imagePart.inlineData.data, 'base64')
    };

    console.log('✅ Generated:', `${(imageData.buffer.length/1024).toFixed(2)} KB`);
    
    return imageData;

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

/**
 * Generate with retry logic
 */
export async function generateImageWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 Attempt ${i + 1}/${maxRetries}`);
      return await generateImage(prompt);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const wait = Math.pow(2, i) * 1000;
      console.log(`⏳ Waiting ${wait/1000}s...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

/**
 * Save image locally
 */
export async function saveImageLocally(imageData, filename) {
  const dir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, imageData.buffer);
  
  console.log(`💾 Saved: ${filepath}`);
  return filepath;
}

/**
 * Validate API key
 */
export async function validateApiKey() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    await model.generateContent('test');
    console.log('✅ API key valid');
    return true;
  } catch (error) {
    console.error('❌ Invalid API key');
    return false;
  }
}
