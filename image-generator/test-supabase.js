// =====================================================
// Test Supabase Storage Upload
// =====================================================

import dotenv from 'dotenv';
import { 
  testSupabaseConnection,
  ensureBucketExists,
  downloadAndUpload 
} from './supabase.js';

dotenv.config();

async function testSupabaseUpload() {
  console.log('🧪 Testing Supabase Storage Integration\n');
  
  // Check environment variables
  console.log('1️⃣ Checking configuration...');
  console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌ MISSING');
  console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅' : '❌ MISSING');
  console.log('   STORAGE_BUCKET:', process.env.STORAGE_BUCKET || 'recipe-images');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('\n❌ Missing Supabase credentials in .env file!');
    console.log('\nAdd these to .env:');
    console.log('SUPABASE_URL=https://your-project.supabase.co');
    console.log('SUPABASE_SERVICE_KEY=your-service-key');
    process.exit(1);
  }
  
  console.log('');
  
  // Test connection
  console.log('2️⃣ Testing Supabase connection...');
  const connected = await testSupabaseConnection();
  if (!connected) {
    console.error('❌ Cannot connect to Supabase');
    process.exit(1);
  }
  console.log('');
  
  // Ensure bucket exists
  console.log('3️⃣ Checking storage bucket...');
  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    console.error('❌ Storage bucket not ready');
    process.exit(1);
  }
  console.log('');
  
  // Test upload with our existing Imagen 4 output
  console.log('4️⃣ Testing image upload...');
  console.log('   Using: output-imagen4.png\n');
  
  try {
    // Read the local file
    const fs = await import('fs/promises');
    const buffer = await fs.readFile('output-imagen4.png');
    
    console.log(`   📦 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
    
    // Upload to Supabase
    const { uploadImageToStorage } = await import('./supabase.js');
    
    const result = await uploadImageToStorage(buffer, {
      prefix: 'test',
      extension: 'png',
      folder: 'test-uploads',
      metadata: {
        source: 'imagen-4',
        test: true,
        generated_at: new Date().toISOString()
      }
    });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    console.log('\n✅ SUCCESS!');
    console.log('📁 Storage path:', result.path);
    console.log('🌐 Public URL:', result.publicUrl);
    console.log('\n💡 Test the URL in your browser!');
    
  } catch (error) {
    console.error('\n❌ Upload test failed:', error.message);
    
    if (error.code === 'ENOENT') {
      console.log('\n💡 File not found. Run first:');
      console.log('   node test-imagen4.js');
    }
  }
}

// Run test
testSupabaseUpload().catch(console.error);