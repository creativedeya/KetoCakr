// =====================================================
// Test Script - Generate Single Image
// Quick test to verify Gemini 2.5 Flash Image works
// =====================================================

import { generateImage, saveImageLocally, validateApiKey } from './gemini.js';
import { generateStepPrompt } from './prompts.js';

async function testImageGeneration() {
  console.log('🧪 Testing Gemini 2.5 Flash Image Generation\n');

  // Step 1: Validate API key
  console.log('1️⃣ Validating API key...');
  const isValid = await validateApiKey();
  if (!isValid) {
    console.error('❌ Invalid API key. Check your .env file');
    process.exit(1);
  }
  console.log('');

  // Step 2: Generate test image
  console.log('2️⃣ Generating test image...');
  
  const testPrompt = generateStepPrompt({
    stepNumber: 1,
    stepDescription: 'Разбийте яйцата със захарта в стъклена купа',
    recipeName: 'Шоколадов блат',
    style: 'overhead',
    lighting: 'natural',
    background: 'marble'
  });

  console.log('\n📝 Generated prompt:');
  console.log('---');
  console.log(testPrompt);
  console.log('---\n');

  try {
    const imageData = await generateImage(testPrompt);
    
    // Step 3: Save locally
    console.log('\n3️⃣ Saving image...');
    const filename = `test-${Date.now()}.png`;
    const filepath = await saveImageLocally(imageData, filename);
    
    console.log('\n✅ SUCCESS!');
    console.log(`📁 Image saved to: ${filepath}`);
    console.log(`📊 Size: ${(imageData.buffer.length / 1024).toFixed(2)} KB`);
    console.log(`🖼️ Type: ${imageData.mimeType}`);
    console.log('\n💡 Open the image to verify quality!');
    
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run test
testImageGeneration().catch(console.error);
