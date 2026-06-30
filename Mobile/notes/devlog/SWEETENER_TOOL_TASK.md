# ACTIVE TASK: Sweetener Comparison Tool

**Status:** In Progress  
**Date:** 2026-04-30  
**Components:** Database + Admin Panel + Mobile Tool  
**Goal:** Complete admin & mobile implementation for sweetener management

---

## 📊 What's Done

✅ **Database Migration** → `create_sweeteners_table.sql`
- Supabase table with all sweetener attributes
- RLS policies (public read, admin write)
- Indexes for performance

✅ **Seed Data** → `SWEETENERS_SEED_DATA.json`
- 20 sweeteners (natural, synthetic, semi-natural)
- Bilingual (EN/BG)
- All attributes populated

---

## 🖥️ Admin Panel (TO BUILD)

### Files to Create:

```
admin/app/dashboard/sweeteners/
├── page.tsx              # List page (table with filters/sort)
├── create/
│   └── page.tsx         # Create new sweetener form
└── [id]/
    └── page.tsx         # Edit sweetener form

admin/components/sweeteners/
├── SweetenersTable.tsx   # Table component
├── SweetenerForm.tsx     # Reusable form for create/edit
└── SweetenerFilters.tsx  # Filter panel
```

### Features:

**1. List Page** (`/dashboard/sweeteners`)
- Table with columns:
  - Icon + Name
  - Source (Natural/Synthetic/Semi-natural)
  - Glycemic Index (color-coded)
  - Sweetness Ratio
  - Keto (✓/✗)
  - Actions (Edit, Delete)
- Filters:
  - Source (dropdown)
  - GI range (slider)
  - Keto only (toggle)
  - Search by name
- Sort: By GI, Sweetness, Name, Price
- Delete with confirmation

**2. Create Form** (`/dashboard/sweeteners/create`)
- All fields from sweeteners table
- Bilingual input (EN/BG)
- Array fields (common_uses, pros, cons, combinations)
  - Add/remove buttons for each item
- Source selector (radio: natural/synthetic/semi-natural)
- Price selector (low/mid/high)
- is_active toggle
- Display order number
- Submit → Insert to DB

**3. Edit Form** (`/dashboard/sweeteners/[id]`)
- Same as create form but pre-populated
- Submit → Update to DB

---

## 📱 Mobile Tool (TO BUILD)

### Files to Create:

```
Mobile/app/(tabs)/tools/sweetener-comparison/
├── index.tsx            # Main tool screen
├── ComparisonTable.tsx   # Sortable table
├── Filters.tsx          # Filter panel
├── Calculator.tsx       # Conversion calculator
├── DetailModal.tsx      # Full sweetener details
├── types.ts             # TypeScript types
└── data/
    └── sweeteners.json  # Seed data (copy from admin)
```

### Features:

**1. Main Screen** (`index.tsx`)
- Header: "Sweetener Comparison Tool"
- Filters panel (collapsible)
- Table with sortable columns
- Click row → Detail modal

**2. Filters Panel**
```
□ Natural only
□ Synthetic only
□ Semi-natural only
[GI Slider: 0—100]
□ Keto-friendly
□ Low price
[Search: ________]
[Apply] [Clear]
```

**3. Comparison Table**
Columns:
- 🎯 Icon + Name
- 🌿 Source (color-coded)
- 📊 GI (red/yellow/green)
- 🍯 Sweetness (% vs sugar)
- ✅ Keto
- 💰 Price
- ℹ️ Details button

Sorting: Click header to sort

**4. Calculator** (separate tab)
```
Input: "I want to replace X grams of sugar"
↓
Shows all active sweeteners with:
  - Exact grams needed
  - Cost estimate
  - GI comparison
  - Recommendation badge
↓
Example:
  "100g sugar"
  ✓ Erythritol: 142g (crystallize warning)
  ✓ Allulose: 133g (BEST)
  ✓ Allulose+Eryth: 70g + 60g (GOLD STANDARD)
```

**5. Detail Modal**
When user taps a sweetener:
```
[Icon] [Name EN/BG]
Source: Natural / Synthetic / Semi-natural
GI: [value] [visual bar]
Sweetness: [X]x vs sugar
Keto: ✓/✗
Price: Low/Mid/High

[Full Description]

Pros:
- Pro 1
- Pro 2
- ...

Cons:
- Con 1
- Con 2
- ...

Common Uses:
- Use 1
- Use 2
- ...

Recommended Combinations:
- Sweetener A
- Sweetener B
- ...
```

---

## 🗂️ Database Query (Mobile)

```typescript
const fetchSweeteners = async () => {
  const { data, error } = await supabase
    .from('sweeteners')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  return data;
};
```

---

## 🎨 UI Design Specs

### Colors (for visual coding):

**Source:**
- 🟢 Natural: #10B981
- 🔴 Synthetic: #EF4444
- 🟡 Semi-natural: #F59E0B

**Glycemic Index:**
- 🟢 Low (0-35): #10B981
- 🟡 Medium (36-55): #F59E0B
- 🔴 High (56+): #EF4444

**Sweetness Ratio:**
- Bar chart: width = ratio percentage
- Color: Match theme (ruby/beige from KetoCakr)

**Price:**
- 💰 Low: $
- 💰💰 Mid: $$
- 💰💰💰 High: $$$

---

## 📋 Implementation Steps

### Phase 1: Setup (Done)
- ✅ Database schema
- ✅ Seed data

### Phase 2: Admin Panel (TO DO)
1. Create `SweetenersTable.tsx` component
2. Create `SweetenerForm.tsx` component
3. Create `/dashboard/sweeteners/page.tsx`
4. Create `/dashboard/sweeteners/create/page.tsx`
5. Create `/dashboard/sweeteners/[id]/page.tsx`
6. Test CRUD operations

### Phase 3: Mobile Tool (TO DO)
1. Copy seed data to mobile app
2. Create `types.ts` (Sweetener interface)
3. Create `ComparisonTable.tsx`
4. Create `Filters.tsx`
5. Create `Calculator.tsx`
6. Create `DetailModal.tsx`
7. Create `index.tsx` (main)
8. Add to Tools navigation
9. Test in simulator

### Phase 4: Polish (TO DO)
- Error handling
- Loading states
- Performance optimization
- Mobile responsiveness
- Accessibility

---

## 📝 Next Steps

**Choose which to build first:**

A) **Admin Panel first** (complete CRUD before mobile)
B) **Mobile Tool first** (get UI working, then admin backend)
C) **Both in parallel** (time permitting)

**Token estimate:**
- Admin components: ~8,000 tokens
- Mobile components: ~12,000 tokens
- Testing & debugging: ~3,000 tokens
- **Total: ~23,000 tokens** ✅ (We have 40k remaining)

---

## 🚀 Ready to Build?

Ако е готина сега, ще направя:
1. Admin CRUD pages (List, Create, Edit)
2. Mobile Tool (Table, Filters, Calculator, Detail)
3. Navigation setup

**Да ли да продължим?** 🎯

