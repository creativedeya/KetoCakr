import crypto from 'crypto';

interface FatSecretServing {
  serving_id: string;
  serving_description: string;
  metric_serving_amount: string;
  metric_serving_unit: string;
  calories: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  saturated_fat?: string;
  polyunsaturated_fat?: string;
  monounsaturated_fat?: string;
  trans_fat?: string;
  cholesterol?: string;
  sodium?: string;
  potassium?: string;
  fiber?: string;
  sugar?: string;
  added_sugars?: string;
  vitamin_a?: string;
  vitamin_c?: string;
  vitamin_d?: string;
  calcium?: string;
  iron?: string;
  magnesium?: string;
}

interface FatSecretFood {
  food_id: string;
  food_name: string;
  food_description: string;
  brand_name?: string;
  food_type?: string;
  food_url?: string;
  servings?: {
    serving: FatSecretServing | FatSecretServing[];
  };
}

interface FatSecretSearchFood {
  food_id: string;
  food_name: string;
  food_description: string;
  brand_name?: string;
  food_type?: string;
  food_url?: string;
}

interface FatSecretResponse {
  foods?: {
    food: FatSecretSearchFood[];
  };
  food?: FatSecretFood;
  error?: {
    code: number;
    message: string;
  };
}

const BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

/**
 * Parse nutrition data from FatSecret food_description
 * ⚠️ WARNING: For DISPLAY purposes only (quick preview in search results).
 * DO NOT use for actual nutrition calculations — use getFatSecretNutritionPer100g() instead.
 */
export function parseNutritionFromDescription(description: string): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  serving_size_g: number;
  per_100g: boolean;
} {
  console.log('🔬 [FS] Parsing description:', description);

  // Extract serving size (e.g., "Per 100g", "Per 1oz - 28g", "Per 1 cup - 120g")
  const servingSizeMatch = description.match(/Per\s+(?:(\d+\.?\d*)g|.*?-\s*(\d+\.?\d*)g)/i);
  const servingSize = servingSizeMatch
    ? parseFloat(servingSizeMatch[1] || servingSizeMatch[2] || '100')
    : 100;

  console.log('📏 [FS] Detected serving size:', servingSize, 'g');

  // Extract nutrition values
  const calories = parseFloat(description.match(/Calories:\s*(\d+\.?\d*)/i)?.[1] || '0');
  const fat = parseFloat(description.match(/Fat:\s*(\d+\.?\d*)g/i)?.[1] || '0');
  const carbs = parseFloat(description.match(/Carbs:\s*(\d+\.?\d*)g/i)?.[1] || '0');
  const protein = parseFloat(description.match(/Protein:\s*(\d+\.?\d*)g/i)?.[1] || '0');
  const fiber = description.match(/Fiber:\s*(\d+\.?\d*)g/i)?.[1];
  const sugar = description.match(/Sugar:\s*(\d+\.?\d*)g/i)?.[1];

  // Calculate multiplier to normalize to 100g
  const multiplier = 100 / servingSize;

  console.log('🔢 [FS] Multiplier:', multiplier, '(100 /', servingSize, ')');

  // Normalize to per 100g
  const normalized = {
    calories: Math.round(calories * multiplier * 10) / 10,
    protein: Math.round(protein * multiplier * 10) / 10,
    carbs: Math.round(carbs * multiplier * 10) / 10,
    fat: Math.round(fat * multiplier * 10) / 10,
    fiber: fiber ? Math.round(parseFloat(fiber) * multiplier * 10) / 10 : undefined,
    sugar: sugar ? Math.round(parseFloat(sugar) * multiplier * 10) / 10 : undefined,
    serving_size_g: servingSize,
    per_100g: true
  };

  console.log('✅ [FS] Normalized to 100g:', normalized);

  return normalized;
}

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string
): string {
  // Sort parameters lexicographically
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');

  console.log('🔐 [FS] Sorted params:', paramString.substring(0, 150) + '...');

  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString)
  ].join('&');

  console.log('🔐 [FS] Base string:', signatureBaseString.substring(0, 150) + '...');

  // Create signing key: consumer_secret&access_secret
  // For 2-legged OAuth (no user), access_secret is empty
  const signingKey = `${percentEncode(consumerSecret)}&`;

  // Generate HMAC-SHA1 signature
  const hmac = crypto.createHmac('sha1', signingKey);
  hmac.update(signatureBaseString);
  const signature = hmac.digest('base64');

  console.log('🔐 [FS] Signature:', signature);

  return signature;
}

export async function fatSecretSearch(
  query: string,
  foodType?: 'generic' | 'brand' | 'all'
): Promise<FatSecretSearchFood[]> {
  console.log('🔬 [FS] ========== fatSecretSearch CALLED ==========');
  console.log('🔬 [FS] query:', query);
  console.log('🔬 [FS] foodType param:', foodType);
  console.log('🔬 [FS] foodType type:', typeof foodType);

  const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
  const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    console.error('❌ [FS] Missing FatSecret credentials');
    throw new Error('FatSecret API credentials not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');

  // Method parameters
  const methodParams: Record<string, string> = {
    method: 'foods.search',
    search_expression: query,
    format: 'json',
    max_results: '20' // Increase to 20 for better variety
  };

  // Add food_type filter if specified
  // FatSecret API expects capitalized values: "Generic" or "Brand"
  if (foodType && foodType !== 'all') {
    const capitalizedType = foodType === 'generic' ? 'Generic' : 'Brand';
    console.log('🔬 [FS] ADDING food_type to methodParams:', capitalizedType);
    methodParams.food_type = capitalizedType;
  } else {
    console.log('🔬 [FS] NOT adding food_type (foodType was:', foodType, ')');
  }

  console.log('🔬 [FS] Final methodParams:', JSON.stringify(methodParams));

  // OAuth parameters
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_nonce: nonce,
    oauth_version: '1.0'
  };

  // Combine ALL parameters for signature
  const allParams = { ...methodParams, ...oauthParams };

  // Generate signature
  const signature = generateOAuthSignature('POST', BASE_URL, allParams, consumerSecret);

  // Add signature to OAuth params
  oauthParams.oauth_signature = signature;

  // Combine ALL params (method + OAuth with signature) for request body
  const allParamsWithSignature = { ...methodParams, ...oauthParams };

  // Build request body with ALL parameters (sorted and encoded)
  const bodyParts = Object.keys(allParamsWithSignature)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(allParamsWithSignature[key])}`);
  
  const body = bodyParts.join('&');

  console.log('📤 [FS] Request body (first 200):', body.substring(0, 200) + '...');

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    });

    console.log('📥 [FS] Response status:', response.status);

    const data: FatSecretResponse = await response.json();

    if (data.error) {
      console.error('❌ [FS] API error:', data.error);
      return [];
    }

    if (!data.foods?.food) {
      console.log('⚠️ [FS] No results found');
      return [];
    }

    let foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
    console.log('✅ [FS] Found', foods.length, 'foods from API');

    // Client-side filtering (FatSecret API ignores food_type parameter)
    if (foodType && foodType !== 'all') {
      const targetType = foodType === 'generic' ? 'Generic' : 'Brand';
      console.log('🔍 [FS] Filtering for food_type:', targetType);

      const beforeCount = foods.length;
      foods = foods.filter(food => food.food_type === targetType);

      console.log(`✅ [FS] Filtered: ${beforeCount} → ${foods.length} (kept only ${targetType})`);
    } else {
      console.log('✅ [FS] No filtering (showing all types)');
    }

    return foods;

  } catch (error) {
    console.error('❌ [FS] Fetch error:', error);
    return [];
  }
}

export async function fatSecretGetFood(foodId: string): Promise<FatSecretFood | null> {
  console.log('🔍 [FS] fatSecretGetFood:', foodId);

  const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
  const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    console.error('❌ [FS] Missing FatSecret credentials');
    throw new Error('FatSecret API credentials not configured');
  }

  // OAuth 1.0a parameters
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');

  // Method parameters
  const methodParams: Record<string, string> = {
    method: 'food.get.v4',
    food_id: foodId,
    format: 'json'
  };

  // OAuth parameters
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_nonce: nonce,
    oauth_version: '1.0'
  };

  // Combine ALL parameters for signature
  const allParams = { ...methodParams, ...oauthParams };

  // Generate signature
  const signature = generateOAuthSignature('POST', BASE_URL, allParams, consumerSecret);

  // Add signature to OAuth params
  oauthParams.oauth_signature = signature;

  // Combine ALL params for request body
  const allParamsWithSignature = { ...methodParams, ...oauthParams };

  // Build request body
  const bodyParts = Object.keys(allParamsWithSignature)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(allParamsWithSignature[key])}`);
  
  const body = bodyParts.join('&');

  console.log('📤 [FS] Fetching food details...');

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body
    });

    console.log('📥 [FS] Response status:', response.status);

    const data = await response.json();

    if (data.error) {
      console.error('❌ [FS] API error:', data.error);
      return null;
    }

    if (!data.food) {
      console.log('⚠️ [FS] Food not found');
      return null;
    }

    console.log('✅ [FS] Food details retrieved');

    return data.food as FatSecretFood;

  } catch (error) {
    console.error('❌ [FS] Fetch error:', error);
    return null;
  }
}

/**
 * Get nutrition data for 100g serving from FatSecret food details
 * Returns native 100g serving if available, otherwise calculates from first serving
 */
export async function getFatSecretNutritionPer100g(foodId: string): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  saturated_fat?: number;
  cholesterol?: number;
  sodium?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  source: 'native_100g' | 'calculated';
} | null> {
  console.log('🔍 [FS] Getting 100g nutrition for food:', foodId);

  const foodDetails = await fatSecretGetFood(foodId);

  if (!foodDetails || !foodDetails.servings) {
    console.error('❌ [FS] No food details or servings found');
    return null;
  }

  // Get servings array
  const servings = Array.isArray(foodDetails.servings.serving)
    ? foodDetails.servings.serving
    : [foodDetails.servings.serving];

  console.log('📊 [FS] Found', servings.length, 'servings');

  // Debug: show all servings
  servings.forEach((s, index) => {
    console.log(`📋 [FS] Serving ${index + 1}:`, {
      description: s.serving_description,
      amount: s.metric_serving_amount,
      unit: s.metric_serving_unit,
      calories: s.calories
    });
  });

  // Try to find native 100g serving
  const serving100g = servings.find(s =>
    s.metric_serving_amount === '100' && s.metric_serving_unit === 'g'
  );

  if (serving100g) {
    console.log('✅ [FS] Found native 100g serving!');

    return {
      calories: parseFloat(serving100g.calories || '0'),
      protein: parseFloat(serving100g.protein || '0'),
      carbs: parseFloat(serving100g.carbohydrate || '0'),
      fat: parseFloat(serving100g.fat || '0'),
      fiber: serving100g.fiber ? parseFloat(serving100g.fiber) : undefined,
      sugar: serving100g.sugar ? parseFloat(serving100g.sugar) : undefined,
      saturated_fat: serving100g.saturated_fat ? parseFloat(serving100g.saturated_fat) : undefined,
      cholesterol: serving100g.cholesterol ? parseFloat(serving100g.cholesterol) : undefined,
      sodium: serving100g.sodium ? parseFloat(serving100g.sodium) : undefined,
      potassium: serving100g.potassium ? parseFloat(serving100g.potassium) : undefined,
      calcium: serving100g.calcium ? parseFloat(serving100g.calcium) : undefined,
      iron: serving100g.iron ? parseFloat(serving100g.iron) : undefined,
      magnesium: serving100g.magnesium ? parseFloat(serving100g.magnesium) : undefined,
      source: 'native_100g'
    };
  }

  // Fallback: calculate from first serving
  console.log('⚠️ [FS] No native 100g serving, calculating from first serving');

  const firstServing = servings[0];
  const servingSize = parseFloat(firstServing.metric_serving_amount || '100');
  const multiplier = 100 / servingSize;

  console.log('🔢 [FS] Fallback calculation - serving size:', servingSize, 'g, multiplier:', multiplier);

  return {
    calories: Math.round(parseFloat(firstServing.calories || '0') * multiplier * 10) / 10,
    protein: Math.round(parseFloat(firstServing.protein || '0') * multiplier * 10) / 10,
    carbs: Math.round(parseFloat(firstServing.carbohydrate || '0') * multiplier * 10) / 10,
    fat: Math.round(parseFloat(firstServing.fat || '0') * multiplier * 10) / 10,
    fiber: firstServing.fiber ? Math.round(parseFloat(firstServing.fiber) * multiplier * 10) / 10 : undefined,
    sugar: firstServing.sugar ? Math.round(parseFloat(firstServing.sugar) * multiplier * 10) / 10 : undefined,
    saturated_fat: firstServing.saturated_fat ? Math.round(parseFloat(firstServing.saturated_fat) * multiplier * 10) / 10 : undefined,
    cholesterol: firstServing.cholesterol ? Math.round(parseFloat(firstServing.cholesterol) * multiplier * 10) / 10 : undefined,
    sodium: firstServing.sodium ? Math.round(parseFloat(firstServing.sodium) * multiplier * 10) / 10 : undefined,
    potassium: firstServing.potassium ? Math.round(parseFloat(firstServing.potassium) * multiplier * 10) / 10 : undefined,
    calcium: firstServing.calcium ? Math.round(parseFloat(firstServing.calcium) * multiplier * 10) / 10 : undefined,
    iron: firstServing.iron ? Math.round(parseFloat(firstServing.iron) * multiplier * 10) / 10 : undefined,
    magnesium: firstServing.magnesium ? Math.round(parseFloat(firstServing.magnesium) * multiplier * 10) / 10 : undefined,
    source: 'calculated'
  };
}