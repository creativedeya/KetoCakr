import { analyzeStepVisual, buildImagenPrompt } from './gpt-analyzer.js';

const testStep = {
  recipeName: 'Малинов кърд (Raspberry Curd)',
  ingredients: 'raspberry puree, butter, sugar, eggs, egg yolks, cornstarch',
  stepNumber: 1,
  totalSteps: 7,
  stepDescription: 'В съдът с незалепващо покритие сложете заедно малиновото пюре, маслото и захарта',
  previousStepDescription: null,
  nextStepDescription: 'Загрейте всичко на котлона, докато маслото се разстопи'
};

console.log('🧪 Testing GPT-4 Visual Analyzer\n');
console.log('Step 1:', testStep.stepDescription);
console.log('');

const visualDesc = await analyzeStepVisual(testStep);

console.log('\n📝 GPT-4 Visual Description:');
console.log(visualDesc);
console.log('\n' + '='.repeat(70));

const finalPrompt = buildImagenPrompt(visualDesc, testStep.recipeName, testStep.stepNumber);

console.log('\n🎨 Final Imagen Prompt:');
console.log(finalPrompt);