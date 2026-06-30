// =====================================================
// Compare FLUX Schnell vs FLUX Pro vs Imagen 4
// Generate same image with all 3 models
// =====================================================

import { 
  generateRecipeStepImage, 
  downloadImage, 
  saveImageLocally,
  validateApiToken 
} from './replicate.js';

async function compareAll3Models() {
  console.log('🥊 3-Way Model Comparison\n');
  console.log('FLUX.1 Schnell vs FLUX 1.1 Pro vs Imagen 4\n');

  // Validate
  console.log('Validating API token...');
  const isValid = await validateApiToken();
  if (!isValid) {
    console.error('❌ Invalid token');
    process.exit(1);
  }

  const testStep = 'Whisking eggs and sugar in a glass bowl until pale and fluffy, overhead view';
  const recipeName = 'Chocolate Sponge Cake';

  console.log('\n📝 Test prompt:', testStep);
  console.log('🎂 Recipe:', recipeName);
  console.log('\n' + '='.repeat(70) + '\n');

  const models = [
    { name: 'flux', label: 'FLUX.1 Schnell', cost: '$0.003', emoji: '⚡' },
    { name: 'flux-pro', label: 'FLUX 1.1 Pro', cost: '$0.04', emoji: '🌟' },
    { name: 'imagen', label: 'Imagen 4', cost: '$0.04', emoji: '🎨' }
  ];

  const results = [];

  for (const model of models) {
    console.log(`${model.emoji} Testing ${model.label}...`);
    const startTime = Date.now();
    
    try {
      const imageUrl = await generateRecipeStepImage(testStep, recipeName, {
        model: model.name,
        style: 'overhead',
        background: 'marble',
        lighting: 'natural'
      });
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      
      const imageData = await downloadImage(imageUrl);
      const filename = `${model.name}-comparison-${Date.now()}.webp`;
      const filepath = await saveImageLocally(imageData, filename);
      
      results.push({
        model: model.label,
        time: elapsed,
        cost: model.cost,
        url: imageUrl,
        file: filepath,
        size: (imageData.buffer.length / 1024).toFixed(2)
      });
      
      console.log(`   ✅ Done in ${elapsed}s`);
      console.log(`   💰 Cost: ${model.cost}`);
      console.log(`   📁 ${filepath}`);
      console.log(`   🌐 ${imageUrl}\n`);
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}\n`);
      results.push({
        model: model.label,
        error: error.message
      });
    }
  }

  console.log('='.repeat(70));
  console.log('\n📊 COMPARISON RESULTS:\n');
  
  results.forEach((r, i) => {
    if (r.error) {
      console.log(`${i + 1}. ${r.model}: ❌ ${r.error}`);
    } else {
      console.log(`${i + 1}. ${r.model}:`);
      console.log(`   ⏱️  Time: ${r.time}s`);
      console.log(`   💰 Cost: ${r.cost}`);
      console.log(`   📦 Size: ${r.size} KB`);
      console.log(`   📁 File: ${r.file}`);
    }
    console.log('');
  });

  console.log('='.repeat(70));
  console.log('\n💡 RECOMMENDATIONS:\n');
  console.log('🏆 Best Quality: FLUX 1.1 Pro or Imagen 4');
  console.log('⚡ Fastest: FLUX.1 Schnell');
  console.log('💰 Best Value: FLUX.1 Schnell ($0.003)');
  console.log('🎯 Production: FLUX 1.1 Pro for heroes, Schnell for steps');
  console.log('\n📸 Open all 3 images and compare side-by-side!');
}

// Run comparison
compareAll3Models().catch(console.error);