# Task: Fix calculateRecipeCost — Cyrillic unit conversion

## Root cause
`calculateRecipeCost` in `Admin/app/dashboard/ready-recipes/[id]/edit/page.tsx`
checks only Latin unit strings (`'g'`, `'ml'`) but the DB stores Cyrillic units (`'г'`, `'мл'`, `'ч.л.'`).

Units in DB: г, мл, ч.л., с.л., бр, за поръсване, по избор, tsp, tbsp, piece, pkg
Price units in DB: kg, l, piece

## Fix in `Admin/app/dashboard/ready-recipes/[id]/edit/page.tsx`

Find the entire `calculateRecipeCost` function's inner loop where normalizedQty is calculated.

Find this block:
```typescript
            // 🔄 Преобразувай количеството в единица съвместима с цената
            let normalizedQty = qty;

            // Ако цената е за килограм/литър, преобразувай количеството в килограми/литри
            if ((priceUnit === 'kg' || priceUnit === 'l') && (qtyUnit === 'g' || qtyUnit === 'ml')) {
              normalizedQty = qty / 1000;  // g → kg, ml → l
            }
            // Ако единици не съвпадат точно (напр. oz, cup и т.н.), приеми че са в една мерна система
            else if (priceUnit !== qtyUnit && !(priceUnit === 'piece' || priceUnit === 'buc' || priceUnit === 'брой')) {
              // 🤔 Различни единици - логирай предупреждение
              console.warn(`  ⚠️ Mismatch: qty unit="${qtyUnit}" but price unit="${priceUnit}"`);
              // Опитай грубо преобразуване
              if ((priceUnit === 'kg' && qtyUnit === 'oz') || 
                  (priceUnit === 'l' && qtyUnit === 'fl oz')) {
                normalizedQty = qty / 35.274; // oz → kg (грубо)
              }
            }

            const ingredientCost = normalizedQty * price;
```

Replace with:
```typescript
            // Normalize unit to standard form (handle Cyrillic + Latin variants)
            const normalizeUnit = (u: string): string => {
              const s = (u || '').toLowerCase().trim();
              // Weight → kg
              if (['г', 'g', 'gr', 'gram', 'grams', 'грам', 'грама'].includes(s)) return 'g';
              // Volume → l
              if (['мл', 'ml', 'милилитър', 'милилитра'].includes(s)) return 'ml';
              // Spoons (approx: tsp=5ml, tbsp=15ml)
              if (['ч.л.', 'tsp', 'ч. л.'].includes(s)) return 'tsp';
              if (['с.л.', 'tbsp', 'с. л.'].includes(s)) return 'tbsp';
              // Pieces
              if (['бр', 'бр.', 'бройки', 'pcs', 'piece', 'pieces', 'pkg', 'брой'].includes(s)) return 'piece';
              // Unknown / zero-quantity decorative units
              if (['за поръсване', 'по избор', 'на вкус', 'на щипка', 'pinch'].includes(s)) return 'zero';
              return s;
            };

            const normQtyUnit = normalizeUnit(qtyUnit);
            let normalizedQty = qty;

            if (normQtyUnit === 'zero') {
              // Decorative/optional — skip cost calculation
              normalizedQty = 0;
            } else if (priceUnit === 'kg') {
              if (normQtyUnit === 'g') normalizedQty = qty / 1000;
              else if (normQtyUnit === 'tsp') normalizedQty = (qty * 5) / 1000;   // tsp → g → kg
              else if (normQtyUnit === 'tbsp') normalizedQty = (qty * 15) / 1000; // tbsp → g → kg
              else if (normQtyUnit === 'oz') normalizedQty = qty / 35.274;
              else normalizedQty = qty / 1000; // fallback: assume grams
            } else if (priceUnit === 'l') {
              if (normQtyUnit === 'ml') normalizedQty = qty / 1000;
              else if (normQtyUnit === 'tsp') normalizedQty = (qty * 5) / 1000;
              else if (normQtyUnit === 'tbsp') normalizedQty = (qty * 15) / 1000;
              else if (normQtyUnit === 'fl oz') normalizedQty = qty / 33.814;
              else normalizedQty = qty / 1000; // fallback: assume ml
            } else if (priceUnit === 'piece' || priceUnit === 'бр' || priceUnit === 'buc') {
              // quantity is already in pieces
              normalizedQty = qty;
            }

            const ingredientCost = normalizedQty * price;
```

## Expected result after fix (бисквитки recipe)
| Ingredient | Qty | Unit | Price/unit | Cost |
|---|---|---|---|---|
| Крема сирене | 200г | г→kg | 12.15/kg | 200/1000 × 12.15 = 2.43 EUR |
| Краве масло | 100г | г→kg | 8.60/kg | 0.86 EUR |
| Еритритол на пудра | 30г | г→kg | 10.00/kg | 0.30 EUR |
| Ванилов екстракт | 1 ч.л. | tsp→l | 42.00/l | 5ml/1000 × 42 = 0.21 EUR |
| Бадемово брашно | 190г | г→kg | 15.00/kg | 2.85 EUR |
| Кокосово брашно | 50г | г→kg | 6.60/kg | 0.33 EUR |
| Бакпулвер | 1 tsp | tsp→kg | 28.80/kg | 5g/1000 × 28.80 = 0.14 EUR |
| гранулен еритритол | 0 за поръсване | zero | — | 0.00 EUR |
| Канела | 0.5 по избор | zero | — | 0.00 EUR |
| **TOTAL** | | | | **~7.12 EUR** |

## Rules
- Surgical edit — replace only the normalizedQty calculation block
- Do NOT change the rest of calculateRecipeCost
- Do NOT touch other files
