// Import 25 Lab Notes from JSON file to Supabase
// Usage: SUPABASE_SERVICE_ROLE_KEY=your-key node admin/scripts/import-lab-notes.js

const fs = require('fs');
const path = require('path');

async function importLabNotes() {
  try {
    console.log('📖 Starting Lab Notes Import...\n');

    // Get keys from environment
    const SUPABASE_URL = 'https://bvnmsiritbqypnnxadnl.supabase.co';
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SERVICE_KEY) {
      console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not set');
      console.log('\nSet it with:');
      console.log('  export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
      console.log('\nOr run:');
      console.log('  SUPABASE_SERVICE_ROLE_KEY=your-key node admin/scripts/import-lab-notes.js');
      process.exit(1);
    }

    // Read the JSON file
    const dataPath = path.join(__dirname, '../notes/devlog/LAB_NOTES_25_DATA.json');
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    const labNotes = JSON.parse(jsonData);

    console.log(`Found ${labNotes.length} Lab Notes to import\n`);

    // Import using direct HTTP calls (more reliable)
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const note of labNotes) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/lab_notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'apikey': SERVICE_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(note)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error inserting "${note.title_en}": ${response.status} ${errorText}`);
          errorCount++;
          errors.push({ title: note.title_en, error: errorText });
        } else {
          console.log(`✅ Created: ${note.title_en} (${note.category})`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception inserting "${note.title_en}":`, err.message);
        errorCount++;
        errors.push({ title: note.title_en, error: err.message });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total: ${labNotes.length}\n`);

    if (errors.length > 0) {
      console.log('📝 Error Details:');
      errors.forEach(e => {
        console.log(`   - ${e.title}: ${e.error}`);
      });
    }

    // Verify in database
    try {
      const verifyResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/lab_notes?is_active=eq.true&recipe_id=is.null&select=id,title_en,category`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'apikey': SERVICE_KEY
          }
        }
      );

      if (verifyResponse.ok) {
        const allNotes = await verifyResponse.json();
        console.log(`📚 Knowledge Base now has ${allNotes.length} active notes\n`);
        
        // Group by category
        const byCategory = {};
        allNotes.forEach(note => {
          byCategory[note.category] = (byCategory[note.category] || 0) + 1;
        });
        
        console.log('📈 Breakdown by category:');
        Object.entries(byCategory).forEach(([cat, count]) => {
          console.log(`   ${cat}: ${count} notes`);
        });
      }
    } catch (err) {
      console.log('⚠️  Could not verify count:', err.message);
    }

  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

importLabNotes();
