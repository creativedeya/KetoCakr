import Replicate from "replicate";
import dotenv from "dotenv";
import { writeFile } from "fs/promises";
import axios from "axios";

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

const input = {
  prompt: `Professional overhead food photography, bird's eye view perspective.

SCENE: Two hands actively whisking eggs and sugar in a large clear glass bowl. One hand firmly grips the stainless steel whisk handle, the other hand steadies the bowl. The whisk wires are immersed in the pale yellow egg mixture, creating a swirling pattern.

HANDS: Natural realistic human hands. Right hand holds whisk handle. Left hand steadies bowl edge.

BOWL: Clear glass bowl with pale yellow egg and sugar mixture, becoming fluffy.

SETTING: Clean white marble countertop, soft natural light, minimal clean aesthetic.

STYLE: Emma's Cake Studio - professional cookbook photography, photorealistic, high-end food magazine quality.`,

  aspect_ratio: "1:1",
  output_format: "webp",
  output_quality: 95,
  prompt_upsampling: true
};

console.log('🌟 Generating with FLUX 1.1 PRO...\n');

try {
  const output = await replicate.run("black-forest-labs/flux-1.1-pro", { input });
  
  console.log('🔍 DEBUG - Raw output:', output);
  console.log('🔍 Type:', typeof output);
  console.log('🔍 Is Array:', Array.isArray(output));
  
  let imageUrl;
  
  // Try different ways to extract URL
  if (typeof output === 'string') {
    imageUrl = output;
  } else if (Array.isArray(output)) {
    console.log('🔍 Array length:', output.length);
    console.log('🔍 First item:', output[0]);
    console.log('🔍 First item type:', typeof output[0]);
    
    const first = output[0];
    if (typeof first === 'string') {
      imageUrl = first;
    } else if (first && first.url) {
      imageUrl = typeof first.url === 'function' ? first.url() : first.url;
    } else if (first && first.toString) {
      imageUrl = first.toString();
    }
  } else if (output && output.url) {
    imageUrl = typeof output.url === 'function' ? output.url() : output.url;
  }
  
  console.log('🔍 Extracted URL:', imageUrl);
  
  if (!imageUrl || imageUrl === 'undefined') {
    console.error('❌ Could not extract URL from output');
    console.log('Full output:', JSON.stringify(output, null, 2));
    process.exit(1);
  }
  
  console.log('📥 Downloading...');
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data);
  
  await writeFile("output-flux-pro.webp", buffer);
  console.log('✅ Saved: output-flux-pro.webp');
  console.log(`📊 ${(buffer.length / 1024).toFixed(2)} KB`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
}