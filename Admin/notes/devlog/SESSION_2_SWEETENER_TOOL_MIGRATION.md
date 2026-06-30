# MIGRATION INSTRUCTIONS: Sweetener Comparison Tool (Full Build)

**Session 2 Focus:** Complete Admin Panel + Mobile Tool Implementation  
**Estimated Duration:** 45-60 minutes  
**Token Budget:** 60,000+ (full session)

---

## 📋 Pre-Session Checklist

Before starting the next session, ensure:

1. ✅ **Database migration has been run** in Supabase
   - SQL file: `admin/migrations/create_sweeteners_table.sql`
   - Execute in Supabase SQL Editor
   - Should create `sweeteners` table with RLS policies

2. ✅ **Seed data is available**
   - File: `admin/notes/devlog/SWEETENERS_SEED_DATA.json`
   - Contains 20 sweeteners with full bilingual content

3. ✅ **Task documentation ready**
   - File: `admin/notes/devlog/SWEETENER_TOOL_TASK.md`
   - Detailed specs for Admin Panel + Mobile Tool

---

## 🗂️ Files Created This Session

### Database & Data:
```
admin/migrations/
└── create_sweeteners_table.sql

admin/notes/devlog/
├── SWEETENERS_SEED_DATA.json
├── SWEETENER_TOOL_TASK.md
└── LAB_NOTES_25_DATA.json (from previous work)
```

### Status Files:
```
admin/notes/devlog/
├── ACTIVE_TASK.md (Lab Notes - completed)
└── SWEETENER_TOOL_TASK.md (Sweetener Tool - NEXT SESSION)
```

---

## 🚀 Session 2: What to Build

### **PART 1: Database Setup** (5 minutes)

**In Supabase Console:**
1. Open: https://app.supabase.com/project/bvnmsiritbqypnnxadnl/sql
2. Create new query
3. Copy ALL from: `admin/migrations/create_sweeteners_table.sql`
4. Click RUN
5. Verify: Table `sweeteners` created with 20 columns + indexes

**Expected output:**
```sql
CREATE TABLE
CREATE INDEX (5 times)
CREATE TRIGGER
ALTER TABLE
CREATE POLICY (2 times)
```

---

### **PART 2: Admin Panel CRUD** (30-35 minutes)

**Create these components (in `/admin`):**

#### 1. **Reusable Form Component**
**File:** `admin/components/sweeteners/SweetenerForm.tsx`
- Input fields for all sweetener attributes
- Bilingual inputs (EN/BG)
- Array field managers (common_uses, pros, cons, combinations)
  - Add/remove buttons per array item
- Dropdown for `source` (natural/synthetic/semi-natural)
- Dropdown for `price` (low/mid/high)
- Slider for `glycemic_index` (0-100)
- Toggle for `is_active`
- Number input for `display_order`
- Submit/Cancel buttons

#### 2. **List Page**
**File:** `admin/app/dashboard/sweeteners/page.tsx`
- Fetch all sweeteners from Supabase
- Display as table:
  - Icon | Name | Source | GI | Sweetness | Keto | Price | Actions
- Filters (sidebar):
  - Source (radio: all/natural/synthetic/semi-natural)
  - GI slider (0-100)
  - Keto toggle
  - Search by name
- Sort options (dropdown)
- Delete button with confirmation modal
- Create button → `/sweeteners/create`
- Edit button → `/sweeteners/[id]`

#### 3. **Create Page**
**File:** `admin/app/dashboard/sweeteners/create/page.tsx`
- Use `SweetenerForm` component
- On submit: INSERT to Supabase
- On success: Navigate to `/dashboard/sweeteners` with toast
- On error: Show error message

#### 4. **Edit Page**
**File:** `admin/app/dashboard/sweeteners/[id]/page.tsx`
- Fetch sweetener by ID
- Populate form with existing data
- On submit: UPDATE in Supabase
- On success: Navigate back with toast
- On error: Show error message

**Navigation Update:**
Edit: `admin/app/dashboard/page.tsx`
- Add link to `/dashboard/sweeteners`

---

### **PART 3: Mobile Tool** (20-25 minutes)

**Create these components (in `/Mobile`):**

#### 1. **Type Definitions**
**File:** `Mobile/app/(tabs)/tools/sweetener-comparison/types.ts`
```typescript
export type SweetenerSource = 'natural' | 'synthetic' | 'semi-natural';
export type PriceLevel = 'low' | 'mid' | 'high';

export type Sweetener = {
  id: string;
  name_en: string;
  name_bg: string;
  icon: string;
  source: SweetenerSource;
  price: PriceLevel;
  glycemic_index: number;
  sweetness_ratio: number;
  net_carbs_per_100g: number;
  calories_per_gram: number;
  keto: boolean;
  taste_profile_en: string;
  taste_profile_bg: string;
  common_uses: string[];
  description_en: string;
  description_bg: string;
  pros_en: string[];
  pros_bg: string[];
  cons_en: string[];
  cons_bg: string[];
  recommended_combinations: string[];
  is_active: boolean;
  display_order: number;
};

export type FilterState = {
  source: 'all' | SweetenerSource;
  giRange: [number, number];
  ketoOnly: boolean;
  searchTerm: string;
};
```

#### 2. **Filter Component**
**File:** `Mobile/app/(tabs)/tools/sweetener-comparison/Filters.tsx`
- Filter chips:
  - Source (Natural | Synthetic | Semi-natural)
  - GI slider (0-100)
  - Keto toggle
  - Search input
- Pass filters to parent via callback

#### 3. **Comparison Table**
**File:** `Mobile/app/(tabs)/tools/sweetener-comparison/ComparisonTable.tsx`
- Scrollable table with columns:
  - Icon + Name
  - Source (color-coded)
  - GI (color-coded bar)
  - Sweetness (%)
  - Keto (✓/✗)
  - Price ($/$$/$$)
- Tap row → open DetailModal
- Sortable columns (click header)

#### 4. **Calculator**
**File:** `Mobile/app/(tabs)/tools/sweetener-comparison/Calculator.tsx`
- Input: Sugar amount (grams or cups)
- Shows all sweeteners with:
  - Required amount
  - Cost estimate (if price data available)
  - GI impact vs original
  - Warnings (crystallization, etc.)
- Recommendation badge for best option

#### 5. **Detail Modal**
**File:** `Mobile/app/(tabs)/tools/sweetener-comparison/DetailModal.tsx`
- Full sweetener information:
  - Icon + Name
  - Source + Price + GI + Sweetness + Keto
  - Description (EN/BG based on language)
  - Pros array
  - Cons array
  - Common uses
  - Recommended combinations
- Close button

#### 6. **Main Screen**
**File:** `Mobile/app/(tabs)/tools/sweetener-comparison/index.tsx`
- Header: "🍬 Sweetener Comparison Tool"
- Fetch sweeteners from Supabase
- State: filters, sorted data, selected sweetener
- Layout:
  - Filters (collapsible)
  - ComparisonTable
  - DetailModal (conditionally shown)
- Loading indicator while fetching
- Error handling

#### 7. **Navigation Update**
Edit: `Mobile/app/(tabs)/tools/index.tsx`
- Add Sweetener Comparison card to Tools overview
- Link to: `/tools/sweetener-comparison`

Edit: `Mobile/app/(tabs)/tools/_layout.tsx`
- Add route: `sweetener-comparison/index.tsx`

---

## 📊 Database Query (Mobile)

```typescript
// lib/supabaseQueries.ts - add this function

export const fetchActiveSweeteners = async () => {
  try {
    const { data, error } = await supabase
      .from('sweeteners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Sweetener[];
  } catch (error) {
    console.error('Error fetching sweeteners:', error);
    return [];
  }
};
```

---

## 🎨 UI/UX Guidelines

### Color Coding:

**Source (Background colors):**
- Natural: `#10B981` (green)
- Synthetic: `#EF4444` (red)
- Semi-natural: `#F59E0B` (amber)

**Glycemic Index (Bar colors):**
- 0-35: `#10B981` (green - low)
- 36-55: `#F59E0B` (amber - medium)
- 56+: `#EF4444` (red - high)

**Theme colors:**
- Primary: `#A80048` (ruby - from KetoCakr)
- Secondary: `#B2AC88` (beige - from KetoCakr)
- Dark: `#333333` (from KetoCakr)

### Typography:
- Headers: Bold, 18-20px
- Subheaders: Semi-bold, 16px
- Body: Regular, 14px
- Small text: Regular, 12px

### Spacing:
- Padding: 16px (standard)
- Margins: 12px between items
- Border radius: 8px (standard)

---

## 🧪 Testing Checklist

### Admin Panel:
- [ ] List page loads with all sweeteners
- [ ] Filters work (source, GI, keto, search)
- [ ] Sorting works
- [ ] Create form submits
- [ ] Edit form pre-populates + submits
- [ ] Delete shows confirmation
- [ ] Array fields (pros, cons) add/remove items
- [ ] Bilingual inputs save correctly

### Mobile Tool:
- [ ] Main screen loads with data
- [ ] Filters work correctly
- [ ] Table displays all columns
- [ ] Sorting by column works
- [ ] Detail modal opens on tap
- [ ] Modal shows all content (EN/BG)
- [ ] Calculator calculates correctly
- [ ] Language toggle works in modal
- [ ] Loading state shows while fetching
- [ ] Error handling works

---

## 📝 Important Notes

1. **RLS Policies:**
   - Public can read `is_active = true` sweeteners
   - Only admins can create/update/delete
   - No auth token needed for public read

2. **Bilingual Support:**
   - Always check `useLanguageStore()` for current language
   - Use `name_en`/`name_bg`, `description_en`/`description_bg`, etc.
   - Apply same pattern as in Lab Notes

3. **Performance:**
   - Load all sweeteners once on component mount
   - Filter in-memory (don't query per filter)
   - Use `useMemo` for filtered/sorted data

4. **Error Handling:**
   - Show toast on admin actions (create/update/delete)
   - Handle network errors gracefully
   - Show loading states

---

## 🔗 Related Files

From previous sessions:
- Lab Notes: `ACTIVE_TASK.md` (completed)
- Lab Notes data: `LAB_NOTES_25_DATA.json`
- Lab Notes components: `admin/components/lab-notes/`

Use these as reference for:
- Form structure (SweetenerForm similar to LabNoteForm)
- List page pattern (SweetenersTable similar to lab-notes list)
- Mobile detail screen (follow Lab Notes detail pattern)

---

## ✅ Success Criteria

**Session 2 is complete when:**

1. ✅ Database table created in Supabase (verified with query)
2. ✅ Admin List page works (CRUD operations tested)
3. ✅ Mobile Tool main screen displays sweeteners
4. ✅ Filters work (mobile + admin)
5. ✅ Detail modal shows full information
6. ✅ Calculator does conversions correctly
7. ✅ Bilingual content displays properly
8. ✅ Navigation integrated into Tools tab
9. ✅ No console errors
10. ✅ UI matches KetoCakr theme colors

---

## 🚀 Starting the Session

1. **First 5 min:** Run database migration (Supabase)
2. **Next 35 min:** Build Admin Panel CRUD
3. **Next 20 min:** Build Mobile Tool
4. **Final 5 min:** Testing + polish

**Total: ~65 minutes** (fit in one session!)

---

## 📞 Questions Before Starting?

- Do you want additional features (tags, sorting preferences, favorites)?
- Mobile-first or admin-first priority?
- Any specific design changes to the color scheme?
- Should sweetener recommendations show as modal or inline?

**Ready to build in Session 2?** 🎯
