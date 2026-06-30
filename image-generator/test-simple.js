import Replicate from "replicate";
import dotenv from "dotenv";

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

const input = {
  prompt: "Test prompt",
  aspect_ratio: "1:1",
  output_format: "png"
};

console.log('Testing Imagen 4 FileOutput...\n');

const output = await replicate.run("google/imagen-4", { input });

console.log('Type:', typeof output);
console.log('Constructor:', output.constructor.name);
console.log('Keys:', Object.keys(output));
console.log('');

// Try all methods to get URL
console.log('Trying .url()...');
if (output.url && typeof output.url === 'function') {
  try {
    const result = output.url();
    console.log('✅ Success:', result);
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
}

console.log('\nTrying .toString()...');
try {
  const result = output.toString();
  console.log('Result:', result);
} catch (e) {
  console.log('❌ Error:', e.message);
}

console.log('\nTrying direct property access...');
console.log('output.url:', output.url);
console.log('output.href:', output.href);
console.log('output.path:', output.path);

console.log('\nTrying Object.getOwnPropertyNames...');
console.log(Object.getOwnPropertyNames(output));