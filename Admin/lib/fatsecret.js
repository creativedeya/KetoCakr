import crypto from 'crypto';

const BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

// ─── Core request — OAuth 1.0 with Authorization header ─────

async function fatSecretRequest(params) {
  console.log('📤 [FS] Request params:', params);

  const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
  const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;

  console.log('🔑 [FS] consumerKey exists:', !!consumerKey);
  console.log('🔑 [FS] consumerKey (first 8):', consumerKey?.substring(0, 8));
  console.log('🔑 [FS] consumerSecret exists:', !!consumerSecret);

  if (!consumerKey || !consumerSecret) {
    throw new Error('FATSECRET_CONSUMER_KEY / FATSECRET_CONSUMER_SECRET не са конфигурирани');
  }

  // Generate OAuth parameters
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // ✅ FIX: Use HEX nonce instead of base64 (no special chars like =, +, /)
  const nonce = crypto.randomBytes(16).toString('hex');

  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_nonce: nonce,
    oauth_version: '1.0',
  };

  console.log('🔐 [FS] nonce:', nonce);
  console.log('🔐 [FS] timestamp:', timestamp);

  // Merge OAuth + API params for signature calculation
  const allParams = { ...oauthParams, ...params };

  // Sort parameters alphabetically
  const sortedKeys = Object.keys(allParams).sort();

  // Build parameter string with URL encoding
  const paramString = sortedKeys
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join('&');

  console.log('🔐 [FS] paramString:', paramString.substring(0, 150) + '...');

  // Build signature base string
  const baseString = [
    'POST',
    encodeURIComponent(BASE_URL),
    encodeURIComponent(paramString),
  ].join('&');

  console.log('🔐 [FS] baseString:', baseString.substring(0, 200) + '...');

  // Generate HMAC-SHA1 signature
  const signingKey = `${encodeURIComponent(consumerSecret)}&`;
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  console.log('🔐 [FS] signature:', signature);

  // Build Authorization header with OAuth params (no URL encoding)
  const authParams = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_nonce: nonce,
    oauth_version: '1.0',
    oauth_signature: signature,
  };

  const authHeader = 'OAuth ' + Object.keys(authParams)
    .sort()
    .map(key => `${key}="${authParams[key]}"`)
    .join(', ');

  // Body contains ONLY API parameters
  const body = new URLSearchParams(params).toString();

  console.log('🔐 [FS] Authorization:', authHeader.substring(0, 150) + '...');
  console.log('📤 [FS] body:', body);

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': authHeader,
    },
    body,
  });

  console.log('📥 [FS] status:', response.status);

  const text = await response.text();
  console.log('📥 [FS] response:', text);

  if (!response.ok) {
    throw new Error(`FatSecret HTTP ${response.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`FatSecret invalid JSON: ${text}`);
  }
}

// ─── Public API ───────────────────────────────────────────────────

export async function fatSecretSearch(query) {
  console.log('🔍 [FS] fatSecretSearch:', query);

  const data = await fatSecretRequest({
    method: 'foods.search',
    search_expression: query,
    format: 'json',
    max_results: '10',
  });

  if (data.error) {
    console.error('❌ [FS] API error:', data.error);
    return [];
  }

  if (!data.foods?.food) {
    console.log('⚠️ [FS] No results');
    return [];
  }

  const foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
  console.log('✅ [FS] Found', foods.length, 'results');

  return foods.map((food) => ({
    id: food.food_id,
    name: food.food_name,
    brand: food.brand_name || null,
    description: food.food_description || '',
    type: food.food_type || 'Generic',
  }));
}

export async function fatSecretGetFood(foodId) {
  console.log('🔍 [FS] fatSecretGetFood:', foodId);

  const data = await fatSecretRequest({
    method: 'food.get.v2',
    food_id: foodId,
    format: 'json',
  });

  if (data.error) {
    console.error('❌ [FS] API error:', data.error);
    return null;
  }

  const food = data.food;
  if (!food) return null;

  const servingsRaw = food.servings?.serving;
  if (!servingsRaw) return null;

  const servingArray = Array.isArray(servingsRaw) ? servingsRaw : [servingsRaw];

  const per100g = servingArray.find(
    (s) => parseFloat(s.metric_serving_amount) === 100 && s.metric_serving_unit === 'g'
  );
  const targetServing = per100g ?? servingArray[0];

  let scaleFactor = 1;
  if (!per100g) {
    const amount = parseFloat(targetServing?.metric_serving_amount ?? '0');
    if (amount > 0 && targetServing?.metric_serving_unit === 'g') {
      scaleFactor = 100 / amount;
    }
  }

  function scale(v) {
    const n = parseFloat(v ?? '');
    if (isNaN(n)) return null;
    return Math.round(n * scaleFactor * 100) / 100;
  }

  const s = targetServing;
  return {
    id: food.food_id,
    name: food.food_name,
    brand: food.brand_name || null,
    nutrients: {
      calories:     scale(s.calories),
      protein:      scale(s.protein),
      fat:          scale(s.fat),
      carbs:        scale(s.carbohydrate),
      fiber:        scale(s.fiber),
      sugar:        scale(s.sugar),
      sugarAlcohol: null,
      saturatedFat: scale(s.saturated_fat),
      cholesterol:  scale(s.cholesterol),
      sodium:       scale(s.sodium),
      calcium:      scale(s.calcium),
      iron:         scale(s.iron),
      magnesium:    scale(s.magnesium),
      potassium:    scale(s.potassium),
      zinc:         scale(s.zinc),
      vitaminA:     scale(s.vitamin_a),
      vitaminC:     scale(s.vitamin_c),
      vitaminD:     scale(s.vitamin_d),
    },
  };
}