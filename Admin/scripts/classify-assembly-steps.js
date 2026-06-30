/**
 * Phase 1 Classification Script — assembly_template_steps
 *
 * Reads every assembly_template_steps row from Supabase, applies keyword-based
 * classification for recipe_role_id and step_type, and prints a review table.
 *
 * DOES NOT run any UPDATE statements — output must be reviewed by the user
 * before applying. Copy the generated UPDATE SQL from the bottom of the output
 * only after verifying the classification list.
 *
 * Run: node scripts/classify-assembly-steps.js
 * (Run from the Admin/ directory)
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { join } = require('path');

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Role name map ─────────────────────────────────────────────────────────────

const ROLE_NAMES = {
  1: 'Base/Блат',
  2: 'Cream/Крем',
  3: 'Filling/Плънка',
  4: 'Decoration/Декор',
};

// ── Keyword classifier ────────────────────────────────────────────────────────

function classifyStep(step) {
  // Combine all text fields into one lowercase haystack for matching
  const text = [
    step.step_description || '',
    step.step_description_bg || '',
    step.step_description_en || '',
    step.image_generation_hints || '',
  ].join(' ').toLowerCase();

  // ── Determine recipe_role_id (which component) ──────────────────────────────
  // Check in specificity order to avoid false matches.

  let recipe_role_id = null;
  let roleReason = 'no role keywords matched';

  if (/блат|sponge|пандишпан|pandishpan/.test(text)) {
    recipe_role_id = 1;
    roleReason = 'base/sponge keywords (блат/sponge/пандишпан)';
  } else if (/плънка|filling|конфи|confi|мармалад|сладко/.test(text)) {
    recipe_role_id = 3;
    roleReason = 'filling keywords (плънка/filling/конфи)';
  } else if (/крем|cream|ganache|ганаш|мус\b|mousse/.test(text)) {
    recipe_role_id = 2;
    roleReason = 'cream keywords (крем/cream/ganache/ганаш)';
  } else if (/декор\b|decoration|garnish|украса|топинг/.test(text)) {
    recipe_role_id = 4;
    roleReason = 'decoration keywords (декор/decoration/garnish)';
  }

  // ── Determine step_type (what kind of action) ───────────────────────────────
  // Checked in priority order: most specific first.
  // Conservative about 'layer' — only assign if unambiguously placing a stack layer.

  let step_type = null;
  let typeReason = '';
  let confidence = 'auto';

  if (/хладилн|фризер|охладет|замразет|refrigerat|chill\b|freeze\b|rest\b|опаков|фолио/.test(text)) {
    // Chilling, freezing, resting, wrapping — no structural layer action
    step_type = 'rest';
    typeReason = 'rest/chill/freeze/wrap keywords';

  } else if (/разрежет|нарежет|cut\b|slice\b|split\b|изрежет|половин|halves|trimm|напоете\b|soak\b|pригответ/.test(text)) {
    // Cutting, slicing, soaking — preparation before layer placement
    step_type = 'prep';
    typeReason = 'prep/cut/soak keywords';

  } else if (/от всички страни|около тортат|отвън|exterior|outside|around the cake|outer coat|облечете/.test(text)) {
    // Applying component to the outside of the cake (not a stack layer)
    step_type = 'outer_coating';
    typeReason = 'outer coating keywords (от всички страни/около тортата/отвън)';

  } else if (/декорирайте|украсете|гарнирайте|поръсете|decorate|garnish|sprinkle|finish with/.test(text)) {
    // Final decoration/garnish actions
    step_type = 'decoration';
    typeReason = 'decoration/garnish keywords';

  } else if (
    recipe_role_id !== null &&
    /сложете|поставете|добавете|нанесете|наредете|place\b|add the|layer|spread\b|put\b/.test(text) &&
    !/около|отвън|от всички страни|exterior|outside|around/.test(text)
  ) {
    // Placing/spreading a component into the stack — only counted as 'layer' when:
    //   1. A role was detected (we know which component)
    //   2. Placement keywords found
    //   3. No "around/outside" keywords (which would make it outer_coating instead)
    step_type = 'layer';
    typeReason = `placement keywords with role=${recipe_role_id} (${ROLE_NAMES[recipe_role_id]})`;

  } else {
    // Couldn't confidently classify — flag for manual review
    step_type = 'other';
    typeReason = 'no strong keyword match — needs manual review';
    confidence = 'manual-review';
  }

  // Downgrade confidence when role and type don't agree logically
  if (step_type === 'layer' && recipe_role_id === 4) {
    // Decoration role shouldn't be a structural 'layer' — suspicious
    step_type = 'other';
    typeReason = 'conflict: decoration role with layer action — needs manual review';
    confidence = 'manual-review';
  }

  return { recipe_role_id, roleReason, step_type, typeReason, confidence };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Fetching assembly_template_steps...\n');

  // Fetch steps joined with template name
  const { data: steps, error } = await supabase
    .from('assembly_template_steps')
    .select(`
      id,
      step_number,
      step_description,
      step_description_bg,
      step_description_en,
      image_generation_hints,
      recipe_role_id,
      step_type,
      assembly_template_id,
      assembly_templates!inner(id, name, template_key)
    `)
    .order('assembly_template_id', { ascending: true })
    .order('step_number', { ascending: true });

  if (error) {
    console.error('❌ Supabase error:', error.message);
    process.exit(1);
  }

  if (!steps || steps.length === 0) {
    console.log('⚠️  No assembly_template_steps rows found.');
    process.exit(0);
  }

  console.log(`Found ${steps.length} step(s) across ${new Set(steps.map(s => s.assembly_template_id)).size} template(s).\n`);

  // Classify each step
  const results = steps.map(step => {
    const classification = classifyStep(step);
    const alreadySet = step.recipe_role_id !== null || step.step_type !== null;
    return {
      step,
      ...classification,
      alreadySet,
    };
  });

  // ── Print review table ────────────────────────────────────────────────────────

  const auto = results.filter(r => r.confidence === 'auto');
  const manual = results.filter(r => r.confidence === 'manual-review');

  console.log('═'.repeat(120));
  console.log('AUTO-CLASSIFIED (review but generally safe):');
  console.log('═'.repeat(120));

  let lastTemplateId = null;
  for (const r of auto) {
    if (r.step.assembly_template_id !== lastTemplateId) {
      console.log(`\n── Template: "${r.step.assembly_templates.name}" (key: ${r.step.assembly_templates.template_key}, id: ${r.step.assembly_template_id}) ──`);
      lastTemplateId = r.step.assembly_template_id;
    }
    const desc = (r.step.step_description_en || r.step.step_description_bg || r.step.step_description || '').slice(0, 70);
    const roleLabel = r.recipe_role_id ? `${r.recipe_role_id} (${ROLE_NAMES[r.recipe_role_id]})` : 'NULL';
    const alreadyMark = r.alreadySet ? ' [ALREADY SET]' : '';
    console.log(
      `  Step ${String(r.step.step_number).padStart(2)} | role=${String(roleLabel).padEnd(20)} | type=${String(r.step_type).padEnd(14)} | "${desc}"${alreadyMark}`
    );
  }

  console.log('\n' + '═'.repeat(120));
  console.log('NEEDS MANUAL REVIEW:');
  console.log('═'.repeat(120));

  lastTemplateId = null;
  for (const r of manual) {
    if (r.step.assembly_template_id !== lastTemplateId) {
      console.log(`\n── Template: "${r.step.assembly_templates.name}" (key: ${r.step.assembly_templates.template_key}, id: ${r.step.assembly_template_id}) ──`);
      lastTemplateId = r.step.assembly_template_id;
    }
    const desc = (r.step.step_description_en || r.step.step_description_bg || r.step.step_description || '').slice(0, 80);
    const roleLabel = r.recipe_role_id ? `${r.recipe_role_id} (${ROLE_NAMES[r.recipe_role_id]})` : 'NULL';
    console.log(
      `  Step ${String(r.step.step_number).padStart(2)} [id=${r.step.id}] | role=${String(roleLabel).padEnd(20)} | type=other | reason: ${r.typeReason}`
    );
    console.log(`            Description: "${desc}"`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(120));
  console.log('SUMMARY:');
  console.log(`  Total steps:          ${results.length}`);
  console.log(`  Auto-classified:      ${auto.length} (${Math.round(auto.length/results.length*100)}%)`);
  console.log(`  Needs manual review:  ${manual.length} (${Math.round(manual.length/results.length*100)}%)`);
  console.log(`  Already set (skipped): ${results.filter(r => r.alreadySet).length}`);

  const byType = {};
  for (const r of results) { byType[r.step_type] = (byType[r.step_type] || 0) + 1; }
  console.log('\n  Proposed step_type distribution:');
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`    ${String(type).padEnd(16)} ${count}`);
  }

  const byRole = {};
  for (const r of results) {
    const key = r.recipe_role_id ? `${r.recipe_role_id} (${ROLE_NAMES[r.recipe_role_id]})` : 'NULL';
    byRole[key] = (byRole[key] || 0) + 1;
  }
  console.log('\n  Proposed recipe_role_id distribution:');
  for (const [role, count] of Object.entries(byRole).sort()) {
    console.log(`    ${String(role).padEnd(24)} ${count}`);
  }

  // ── Generate UPDATE SQL ───────────────────────────────────────────────────────
  // Only for auto-classified rows where columns are not already set.
  const toUpdate = auto.filter(r => !r.alreadySet);
  if (toUpdate.length > 0) {
    console.log('\n' + '═'.repeat(120));
    console.log(`UPDATE SQL (DO NOT RUN until you have reviewed the list above — ${toUpdate.length} rows):`);
    console.log('═'.repeat(120));
    console.log('-- Copy-paste into Supabase SQL editor ONLY after confirming the review table above.\n');

    for (const r of toUpdate) {
      const roleVal = r.recipe_role_id !== null ? r.recipe_role_id : 'NULL';
      const typeVal = r.step_type !== null ? `'${r.step_type}'` : 'NULL';
      const desc = (r.step.step_description_en || r.step.step_description_bg || r.step.step_description || '').slice(0, 60).replace(/'/g, "''");
      console.log(`-- Step ${r.step.step_number} (${r.step.assembly_templates.template_key}): "${desc}"`);
      console.log(`UPDATE assembly_template_steps SET recipe_role_id = ${roleVal}, step_type = ${typeVal} WHERE id = ${r.step.id};`);
    }
  } else {
    console.log('\n✅ No auto-classified rows without existing values — nothing to UPDATE automatically.');
  }

  console.log('\n⚠️  DO NOT run UPDATE statements before reviewing the list above.');
  console.log('     Send the output to the developer for confirmation before applying.\n');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
