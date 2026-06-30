import type { GenerationSettings } from '@/lib/types/generationSettings'

/**
 * Converts GenerationSettings into a prompt text block that can be appended
 * to any AI image generation prompt (Gemini, Reve, Replicate).
 * The block is structured as CRITICAL overrides so the model respects them.
 */
export function buildVisualParams(settings: GenerationSettings): string {
  const bgColor =
    settings.backgroundColor === 'black' ? 'Pure black, matte, no reflections' :
    settings.backgroundColor === 'dark-slate' ? 'Dark slate gray, deep charcoal surface' :
    settings.backgroundColor === 'white' ? 'Pure white, bright and clean' :
    'Blurred, shallow depth-of-field background'

  const angle =
    settings.viewingAngle === 'overhead' ? '90° overhead bird\'s eye view, camera pointing straight down' :
    settings.viewingAngle === '45-degree' ? '45° angle from above, angled perspective' :
    settings.viewingAngle === 'side' ? 'Side profile view, horizontal camera angle' :
    'Extreme close-up macro view, tight crop, very shallow depth of field'

  const lighting =
    settings.lightingStyle === 'studio' ? 'Soft studio lighting, high-key, even illumination, no harsh shadows' :
    settings.lightingStyle === 'natural' ? 'Natural window light, soft diffused daylight from the side' :
    settings.lightingStyle === 'warm' ? 'Warm golden hour lighting, amber and orange tones' :
    settings.lightingStyle === 'cool' ? 'Cool bright lighting, blue-white tones, crisp and clean' :
    'Dramatic side lighting, deep shadows, strong chiaroscuro, high contrast'

  const texture =
    settings.backgroundTexture === 'slate' ? 'Textured dark slate stone surface' :
    settings.backgroundTexture === 'wood' ? 'Rustic wood grain surface, natural wood planks' :
    settings.backgroundTexture === 'marble' ? 'Polished marble surface with subtle veining' :
    settings.backgroundTexture === 'plain' ? 'Plain smooth surface, no visible texture' :
    'Linen fabric texture surface, soft woven cloth'

  return `

VISUAL PARAMETERS (CRITICAL — OVERRIDE CONFLICTING INSTRUCTIONS ABOVE):
- Background Color: ${bgColor}
- Viewing Angle: ${angle}
- Lighting Style: ${lighting}
- Background/Surface Texture: ${texture}
- Full-bleed composition, edge-to-edge, no white borders or frame padding
- Apply these visual parameters with highest priority`
}
