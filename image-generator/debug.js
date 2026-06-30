// Quick debug test
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

console.log('🔍 Debugging API Key...\n');

// Check if .env is loaded
console.log('1. API Key loaded from .env:', process.env.GEMINI_API_KEY ? 'YES ✅' : 'NO ❌');
console.log('   Length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('   First 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10) || 'MISSING');

// Test API
try {
  console.log('\n2. Testing API connection...');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const result = await model.generateContent('Say hello');
  const text = result.response.text();
  
  console.log('   ✅ SUCCESS! API is working');
  console.log('   Response:', text.substring(0, 50));
} catch (error) {
  console.log('   ❌ FAILED!');
  console.log('   Error:', error.message);
  console.log('\n   Possible issues:');
  console.log('   - Invalid API key');
  console.log('   - API key restrictions');
  console.log('   - Network/firewall issue');
}
