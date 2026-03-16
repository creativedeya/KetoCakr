// =====================================================
// FILE: admin/types/image-generation.ts
// TypeScript types for Image Generation APIs
// =====================================================

export type PhotoStyle = 'overhead' | 'angle45' | 'closeup' | 'threequarter';
export type LightingStyle = 'natural' | 'studio' | 'golden' | 'bright';
export type BackgroundStyle = 'marble' | 'wood' | 'concrete' | 'white';

/**
 * Request body for generating a single step image
 */
export interface GenerateStepImageRequest {
  recipeId: string;
  recipeName: string;
  stepNumber: number;
  stepDescription: string;
  stepDescriptionEn?: string | null;
  style?: PhotoStyle;
  lighting?: LightingStyle;
  background?: BackgroundStyle;
}

/**
 * Response from single step image generation
 */
export interface GenerateStepImageResponse {
  success: boolean;
  imageUrl: string;
  stepNumber: number;
  sizeKB: number;
  model: string;
}

/**
 * Request body for batch generating recipe images
 */
export interface GenerateRecipeImagesRequest {
  recipeId: string;
  style?: PhotoStyle;
  lighting?: LightingStyle;
  background?: BackgroundStyle;
  skipExisting?: boolean;
}

/**
 * Individual step result in batch generation
 */
export interface StepGenerationResult {
  success: boolean;
  stepNumber: number;
  imageUrl?: string;
  error?: string;
  time?: number;
}

/**
 * Summary statistics for batch generation
 */
export interface BatchGenerationSummary {
  total: number;
  successful: number;
  failed: number;
  avgTimeSeconds: number;
  estimatedCost: number;
}

/**
 * Response from batch recipe images generation
 */
export interface GenerateRecipeImagesResponse {
  success: boolean;
  summary: BatchGenerationSummary;
  results: StepGenerationResult[];
}

/**
 * Error response from image generation APIs
 */
export interface ImageGenerationError {
  error: string;
}

/**
 * Photo style configurations
 */
export const PHOTO_STYLE_OPTIONS: Record<PhotoStyle, { name: string; description: string }> = {
  overhead: {
    name: 'Overhead (Knolling)',
    description: 'Flat lay from directly above - great for showing all ingredients'
  },
  angle45: {
    name: '45-degree angle',
    description: 'Classic elevated angle - shows depth and layers'
  },
  closeup: {
    name: 'Close-up detail',
    description: 'Tight focus on specific action or texture'
  },
  threequarter: {
    name: '3/4 view',
    description: 'Three-quarter perspective - shows volume and shape'
  }
};

/**
 * Lighting style configurations
 */
export const LIGHTING_STYLE_OPTIONS: Record<LightingStyle, { name: string; description: string }> = {
  natural: {
    name: 'Natural Daylight',
    description: 'Soft window light - authentic and inviting'
  },
  studio: {
    name: 'Studio Lighting',
    description: 'Controlled professional lights - clean and bright'
  },
  golden: {
    name: 'Golden Hour',
    description: 'Warm glowing light - cozy and appetizing'
  },
  bright: {
    name: 'Bright & Clean',
    description: 'High-key lighting - fresh and modern'
  }
};

/**
 * Background style configurations
 */
export const BACKGROUND_STYLE_OPTIONS: Record<BackgroundStyle, { name: string; description: string }> = {
  marble: {
    name: 'White Marble',
    description: 'Clean and elegant - premium aesthetic'
  },
  wood: {
    name: 'Natural Wood',
    description: 'Warm and rustic - homey feeling'
  },
  concrete: {
    name: 'Grey Concrete',
    description: 'Modern and minimal - industrial chic'
  },
  white: {
    name: 'Pure White',
    description: 'Simple and clean - focus on food'
  }
};