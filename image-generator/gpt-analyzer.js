import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Get specific requirements for each step (color, tools, vessels)
 */
function getStepSpecifics(recipeName, stepNumber, totalSteps, stepDescription) {
  const lowerName = recipeName.toLowerCase();
  const lowerDesc = stepDescription.toLowerCase();
  
  let specifics = {
    color: '',
    vessels: '',
    tools: '',
    action: '',
    composition: ''
  };
  
  // RASPBERRY RECIPES
  if (lowerName.includes('raspberry') || lowerName.includes('малинов')) {
    
    // Step 1: Combining raw ingredients
    if (stepNumber === 1 || lowerDesc.includes('сложете заедно') || lowerDesc.includes('combine')) {
      specifics.color = 'VIBRANT DEEP RED raspberry puree, pale yellow butter chunks (solid, not melted), white granulated sugar crystals - ingredients NOT mixed yet';
      specifics.vessels = 'Non-stick saucepan with matte black or dark gray finish';
      specifics.tools = 'Wooden spoon visible at edge of pan';
      specifics.action = 'Raw ingredients placed in pan before any mixing or heating';
      specifics.composition = 'Close-up 45-degree angle on saucepan contents. NO hands visible. Product fills frame.';
    }
    
    // Step 2: Heating/melting
    else if (stepNumber === 2 || lowerDesc.includes('загрей') || lowerDesc.includes('heat') || lowerDesc.includes('топи')) {
      specifics.color = 'BRIGHT RASPBERRY PINK as butter melts into red puree - vibrant red-pink hue, slight bubbling';
      specifics.vessels = 'Same saucepan, stovetop visible in background (soft focus)';
      specifics.tools = 'Wooden spoon stirring the mixture';
      specifics.action = 'Active heating process, butter melting, slight steam';
      specifics.composition = 'Close-up on melting mixture. Minimal stovetop context. NO hands visible.';
    }
    
    // Step 3: Whisking eggs separately
    else if (stepNumber === 3 || lowerDesc.includes('разбий') || lowerDesc.includes('whisk') || lowerDesc.includes('яйца')) {
      specifics.color = 'PURE GOLDEN YELLOW eggs - bright egg yolk color, NO raspberry pink yet';
      specifics.vessels = 'Clear glass mixing bowl';
      specifics.tools = 'Stainless steel balloon whisk partially submerged in eggs';
      specifics.action = 'Whisked eggs showing smooth, creamy texture';
      specifics.composition = 'Close-up 45-degree angle on bowl. Whisk visible. NO hands visible.';
    }
    
    // Step 4: Tempering/combining
    else if (stepNumber === 4 || lowerDesc.includes('налей') || lowerDesc.includes('pour') || lowerDesc.includes('темпер')) {
      specifics.color = 'PALE PINK/CORAL mixture forming - eggs (yellow) being combined with raspberry (red)';
      specifics.vessels = 'Glass bowl with eggs, whisk visible';
      specifics.tools = 'Metal whisk in bowl';
      specifics.action = 'Partially mixed eggs and raspberry showing color transition';
      specifics.composition = 'Close-up on bowl showing pink swirls forming in yellow eggs. NO hands.';
    }
    
    // Step 5-6: Cooking/thickening
    else if (stepNumber <= totalSteps - 1) {
      specifics.color = 'RASPBERRY PINK curd - like strawberry yogurt, clearly pink not yellow';
      specifics.vessels = 'Saucepan on stove';
      specifics.tools = 'Wooden spoon or silicone spatula';
      specifics.action = 'Thickened mixture coating the spoon, glossy texture';
      specifics.composition = 'Close-up on thick pink curd in pan. Spoon showing coating. NO hands.';
    }
    
    // Final step: Testing/finishing
    else {
      specifics.color = 'VIBRANT RASPBERRY PINK finished curd - smooth, glossy, like pink custard';
      specifics.vessels = 'Glass jar or clear bowl with finished curd';
      specifics.tools = 'Metal spoon showing trail test or jar with lid nearby';
      specifics.action = 'Finished curd in storage vessel, smooth surface';
      specifics.composition = 'Close-up on finished product in jar. Clean, professional.';
    }
  }
  
  // LEMON/CITRUS RECIPES
  else if (lowerName.includes('lemon') || lowerName.includes('лимон') || lowerName.includes('orange') || lowerName.includes('портокал')) {
    specifics.color = 'BRIGHT CITRUS YELLOW - vibrant lemon/orange color throughout';
    specifics.vessels = 'Appropriate vessel for step';
    specifics.tools = 'Appropriate tools for step';
    specifics.composition = 'Close-up 45-degree angle. Product focused. NO hands.';
  }
  
  // CHOCOLATE RECIPES
  else if (lowerName.includes('chocolate') || lowerName.includes('шоколад') || lowerName.includes('какао')) {
    specifics.color = 'RICH DARK BROWN chocolate color';
    specifics.vessels = 'Appropriate vessel for step';
    specifics.tools = 'Appropriate tools for step';
    specifics.composition = 'Close-up 45-degree angle. Product focused. NO hands.';
  }
  
  // VANILLA/CREAM RECIPES
  else if (lowerName.includes('cream') || lowerName.includes('крем') || lowerName.includes('vanilla') || lowerName.includes('ванилия')) {
    specifics.color = 'PALE CREAM or IVORY color';
    specifics.vessels = 'Appropriate vessel for step';
    specifics.tools = 'Appropriate tools for step';
    specifics.composition = 'Close-up 45-degree angle. Product focused. NO hands.';
  }
  
  // DEFAULT for unknown recipes
  else {
    specifics.color = 'Natural color appropriate for the ingredients';
    specifics.vessels = 'Appropriate vessel for this step';
    specifics.tools = 'Appropriate tools for this step';
    specifics.composition = 'Close-up 45-degree angle. Product focused. NO hands.';
  }
  
  return specifics;
}

export async function analyzeStepVisual(stepData) {
  const {
    recipeName,
    ingredients,
    stepNumber,
    totalSteps,
    stepDescription,
    previousStepDescription,
    nextStepDescription
  } = stepData;

  const progressPercent = (stepNumber / totalSteps) * 100;
  const stage = progressPercent < 30 ? 'early preparation' :
                progressPercent < 60 ? 'active cooking/mixing' :
                progressPercent < 90 ? 'finishing/finalizing' :
                'completed product';

  const specifics = getStepSpecifics(recipeName, stepNumber, totalSteps, stepDescription);

  const analysisPrompt = `You are a food photography director specializing in close-up product photography for recipe blogs. Generate a detailed visual description following Emma's Cake Studio style.

RECIPE: ${recipeName}
STAGE: ${stage} (step ${stepNumber} of ${totalSteps})

CURRENT STEP: ${stepDescription}
${previousStepDescription ? `Previous: ${previousStepDescription}` : 'First step'}
${nextStepDescription ? `Next: ${nextStepDescription}` : 'Final step'}

CRITICAL PHOTOGRAPHY STYLE - Emma's Cake Studio:

FRAMING & ANGLE:
- Close-up 45-degree angle (NOT overhead bird's eye view)
- Product fills 70-80% of frame
- Tight crop on the main subject (bowl, pan, or vessel)
- Minimal background visible

COMPOSITION:
- Shallow depth of field
- Main subject in sharp focus
- Background soft and minimal
- Clean, professional product shot
- Magazine-quality close-up

BACKGROUND:
- Barely visible neutral surface
- Out of focus
- No scattered props or ingredients
- Minimal visual noise

COLOR REQUIREMENT:
${specifics.color}

VESSELS/TOOLS:
${specifics.vessels}
${specifics.tools}

OUTPUT: Generate a single detailed paragraph (120-150 words) describing EXACTLY what should be photographed. Focus on:
- Exact camera angle (close 45-degree)
- What fills the frame (the product/vessel)
- Specific colors and textures visible
- Tools visible in frame
- What should NOT be in frame (hands, extra props, overhead view)

Be extremely specific about the CLOSE-UP, PRODUCT-FOCUSED nature of the shot.`;

  try {
    console.log('   🤖 Analyzing step with GPT-4 (Emma style)...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a food photography director specializing in close-up product photography. You provide precise visual descriptions for Emma\'s Cake Studio style: tight crops, 45-degree angles, minimal backgrounds, and NO visible hands.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const visualDescription = response.choices[0].message.content.trim();
    
    console.log('   ✅ Visual analysis complete (Emma style)');
    console.log(`   📝 Description: ${visualDescription.substring(0, 100)}...`);
    
    return visualDescription;

  } catch (error) {
    console.error('   ❌ GPT-4 analysis failed:', error.message);
    return `Close-up 45-degree shot of ${stepDescription}. Product fills frame. NO hands visible. Emma's Cake Studio style.`;
  }
}
// В края на gpt-analyzer.js файла:

/**
 * Build final Imagen prompt from GPT-4 analysis
 */
export function buildImagenPrompt(visualDescription, recipeName, stepNumber) {
  return `Close-up food photography, 45-degree angle perspective.

SCENE:
${visualDescription}

Context: Step ${stepNumber} in making ${recipeName}.

PHOTOGRAPHY STYLE - Emma's Cake Studio:
- Close-up product shot (NOT overhead bird's eye view)
- 45-degree angle
- Product fills 70-80% of frame
- Tight crop on main subject
- Professional magazine quality
- Photorealistic (NOT illustration)
- Sharp focus on subject
- Soft-blur minimal background
- Natural, realistic colors
- Shallow depth of field


COMPOSITION:
- Tight crop focusing on the food/vessel
- Minimal background visible
- Clean, professional product photography
- No scattered props or clutter

FORBIDDEN:
- Overhead bird's eye view
- Visible hands or multiple hands
- Wide shots with empty space
- Cluttered backgrounds
- Follow the scene description exactly`;
}