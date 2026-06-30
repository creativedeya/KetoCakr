// =====================================================
// Supabase Storage Integration
// Upload generated images to Supabase Storage
// =====================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'recipe-images';

/**
 * Ensure storage bucket exists
 */
export async function ensureBucketExists() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const bucketExists = buckets?.some(b => b.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      console.log(`📦 Creating bucket: ${STORAGE_BUCKET}`);
      const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
      });
      
      if (error) throw error;
      console.log('✅ Bucket created');
    } else {
      console.log(`✅ Bucket exists: ${STORAGE_BUCKET}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error with bucket:', error.message);
    return false;
  }
}

/**
 * Generate unique filename
 */
function generateFilename(prefix = 'step', extension = 'png') {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${timestamp}-${random}.${extension}`;
}

/**
 * Upload image buffer to Supabase Storage
 */
export async function uploadImageToStorage(imageBuffer, options = {}) {
  const {
    prefix = 'step',
    extension = 'png',
    folder = 'steps',
    metadata = {}
  } = options;

  try {
    const filename = generateFilename(prefix, extension);
    const filepath = folder ? `${folder}/${filename}` : filename;
    
    console.log(`📤 Uploading to: ${STORAGE_BUCKET}/${filepath}`);
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filepath, imageBuffer, {
        contentType: `image/${extension}`,
        cacheControl: '3600',
        upsert: false,
        metadata
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filepath);
    
    console.log('✅ Uploaded successfully');
    console.log('🌐 Public URL:', urlData.publicUrl);
    
    return {
      success: true,
      path: filepath,
      publicUrl: urlData.publicUrl,
      bucket: STORAGE_BUCKET
    };
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Download image from URL and upload to Supabase
 */
export async function downloadAndUpload(imageUrl, options = {}) {
  try {
    console.log('📥 Downloading image from Replicate...');
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    const buffer = Buffer.from(response.data);
    const sizeKB = (buffer.length / 1024).toFixed(2);
    
    console.log(`✅ Downloaded: ${sizeKB} KB`);
    
    // Upload to Supabase
    return await uploadImageToStorage(buffer, options);
    
  } catch (error) {
    console.error('❌ Download/Upload failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update recipe_instruction_steps with image URL
 */
export async function updateStepImage(stepId, imageUrl) {
  try {
    console.log(`📝 Updating step ${stepId} with image...`);
    
    const { data, error } = await supabase
      .from('recipe_instruction_steps')
      .update({ step_image_url: imageUrl })
      .eq('id', stepId)
      .select();
    
    if (error) throw error;
    
    console.log('✅ Step updated in database');
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Database update failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('recipe_instruction_steps')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Supabase connected successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}