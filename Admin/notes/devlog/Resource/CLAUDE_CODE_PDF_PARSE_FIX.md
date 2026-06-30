# Fix: pdf-parse Module Not Found Error

## Error
```
Module not found: Package path ./lib/pdf-parse.js is not exported from package
Admin/node_modules/pdf-parse
```

## Root Cause
`require('pdf-parse/lib/pdf-parse.js')` — subpath not exported by this version of pdf-parse.

---

## Fix 1 — Change the require() call

In `Admin/utils/pdfParser.ts`, find and replace:
```typescript
const pdfParse = require('pdf-parse/lib/pdf-parse.js');
```
With:
```typescript
const pdfParse = require('pdf-parse');
```

Then test: `npm run dev` and try uploading the PDF.

---

## Fix 2 — If Fix 1 causes pdfjs-dist conflict in Next.js

If you see a new error about `canvas`, `pdfjs-dist`, or `worker` after Fix 1,
add this to `Admin/next.config.js` inside the `webpack` config function:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config ...
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }
    return config;
  },
};
```

If `webpack` block already exists, just add the `if (!isServer)` block inside it.

---

## Fix 3 — If both above fail (nuclear option)

Move PDF parsing OUT of Next.js entirely into a standalone script.

### 3a. Create `Admin/scripts/parsePDF.ts`
```typescript
import fs from 'fs';
import pdfParse from 'pdf-parse';

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: npx ts-node scripts/parsePDF.ts <path-to-pdf>');
    process.exit(1);
  }

  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer, { max: 3 });
  
  const lines = data.text.split('\n');
  const names: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 4) continue;
    if (/^\d+$/.test(trimmed)) continue;
    
    // TOC format: "Recipe Name ..... 12"
    const match = trimmed.match(/^(.+?)[\s.·•]+(\d{1,3})\s*$/);
    if (match) {
      const name = match[1].trim();
      if (name.length >= 4) names.push(name);
    }
    
    // Spanish books: "12  Recipe Name"
    const reverseMatch = trimmed.match(/^(\d{1,3})\s{2,}(.+)$/);
    if (reverseMatch) {
      const name = reverseMatch[2].trim();
      if (name.length >= 4) names.push(name);
    }
  }
  
  console.log(JSON.stringify([...new Set(names)], null, 2));
}

main().catch(console.error);
```

### 3b. Run it from terminal (outside Next.js):
```bash
cd Admin
npx ts-node --skip-project scripts/parsePDF.ts "C:\Dev\KetoCakr\admin\notes\Испанска_кето_книга (1).pdf"
```

### 3c. If Fix 3 is needed, update parse/route.ts to call this script via child_process:
```typescript
import { execFile } from 'child_process'
import path from 'path'

// In the route handler:
const scriptPath = path.join(process.cwd(), 'scripts', 'parsePDF.ts')
const result = await new Promise<string[]>((resolve, reject) => {
  execFile('npx', ['ts-node', '--skip-project', scriptPath, assembledFilePath], 
    { maxBuffer: 1024 * 1024 },
    (err, stdout) => {
      if (err) reject(err)
      else resolve(JSON.parse(stdout))
    }
  )
})
// result = array of recipe names
```

---

## Order of attempts
1. Try Fix 1 first (1 line change, 30 seconds)
2. If new error → Fix 2 (next.config.js webpack tweak)
3. If still broken → Fix 3 (standalone script)

Report which fix worked.
