import Replicate from "replicate";
import dotenv from "dotenv";
import { writeFile } from "fs/promises";
import axios from "axios";

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

// Imagen 4 prompt - Google's photorealism engine
const input = {
  prompt: `Professional overhead food photography, bird's eye view.

Scene: A woman's hand firmly gripping and holding a stainless steel whisk, actively whisking eggs and sugar in a large clear glass bowl. The hand's fingers are wrapped around the whisk handle. The whisk is being held by the hand and moved through the mixture. A second hand steadies the bowl.

The bowl contains beaten eggs mixed with granulated sugar, creating a pale yellow, slightly foamy mixture with beautiful swirl patterns.

Setting: Clean white marble countertop, soft natural window lighting, minimal styling.

Style: Emma's Cake Studio aesthetic - professional cookbook photography, photorealistic, high-end food magazine quality, natural colors, sharp focus.

Important: Realistic hand anatomy, proper grip on whisk handle, natural cooking action.`,

  aspect_ratio: "1:1",
  output_format: "webp"
};

console.log('🎨 Generating with IMAGEN 4 (Google)...\n');
console.log('💰 Cost: ~$0.04\n');

try {
  const output = await replicate.run("google/imagen-4", { input });
  
  console.log('🔍 Raw output:', output);
  console.log('🔍 Type:', typeof output);
  
  let imageUrl;
  
  if (typeof output === 'string') {
    imageUrl = output;
  } else if (Array.isArray(output) && output.length > 0) {
    const first = output[0];
    imageUrl = typeof first === 'string' ? first : 
                (first.url ? (typeof first.url === 'function' ? first.url() : first.url) : first.toString());
  } else if (output && output.url) {
    imageUrl = typeof output.url === 'function' ? output.url() : output.url;
  }
  
  console.log('🔍 Image URL:', imageUrl);
  
  if (!imageUrl || imageUrl === 'undefined') {
    console.error('❌ Could not extract URL');
    console.log('Full output:', JSON.stringify(output, null, 2));
    process.exit(1);
  }
  
  console.log('✅ Image generated!');
  console.log('📥 Downloading...');
  
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data);
  
  await writeFile("output-imagen4.webp", buffer);
  console.log('💾 Saved: output-imagen4.webp');
  console.log(`📊 ${(buffer.length / 1024).toFixed(2)} KB`);
  console.log('\n✨ Google Imagen 4 - let\'s see the photorealism!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Full error:', error);
}