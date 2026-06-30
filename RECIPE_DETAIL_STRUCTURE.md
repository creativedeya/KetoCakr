# Recipe Detail Screen - Component Structure

```
┌─────────────────────────────────────────┐
│           HERO IMAGE (60vh)              │
│  ┌───────────────────────────────────┐  │
│  │     [←]  ............ [♥] [⤴]     │  │ ← Top Actions
│  │                                    │  │
│  │                                    │  │
│  │                                    │  │
│  │      Шоколадова Кето Мечта        │  │ ← Title (bottom: 260px)
│  │                                    │  │
│  │  ╔══════════════════════════════╗ │  │
│  │  ║   245   22g   6g     4g      ║ │  │ ← Nutrition Bar (BlurView)
│  │  ║  ккал мазн. прот. въгл.      ║ │  │   (bottom: 150px)
│  │  ╚══════════════════════════════╝ │  │
│  │                                    │  │
│  │  ╔══════════════════════════════╗ │  │
│  │  ║ [Порции] [Количество]        ║ │  │ ← Mode Switcher
│  │  ║                               ║ │  │
│  │  ║ 1440g  [-] 12  [+]  120g     ║ │  │ ← Servings Controls
│  │  ║           ПОРЦИИ             ║ │  │   (bottom: 25px)
│  │  ╚══════════════════════════════╝ │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   [СЪСТАВКИ] [СТЪПКИ] [СГЛОБЯВАНЕ]      │ ← Tabs
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  [🛒 Добави към списъка за пазаруване]  │ ← Action Button
│                                          │
│  Необходими продукти                     │
│  ┌────────────────────────────────────┐ │
│  │ 200g    Бадемово брашно            │ │
│  │ 50g     Еритритол                  │ │
│  │ 80g     Масло                      │ │
│  │ ...                                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Visual States:

### Mode: Servings (Порции)
```
Hero > Nutrition Bar:
┌─────────────────────────────────────┐
│  245   │  22g   │   6g   │   4g    │
│  ккал  │ мазн.  │ прот.  │ въгл.   │
└─────────────────────────────────────┘

Controls:
┌─────────────────────────────────────┐
│  1440g     [−] 12 [+]      120g     │
│  ОБЩО          ПОРЦИИ    НА ПОРЦИЯ  │
└─────────────────────────────────────┘
```

### Mode: Quantity (Количество)
```
Hero > Weight & Price Bar:
┌─────────────────────────────────────┐
│     1440g      │      48.0 лв       │
│  ОБЩО ТЕГЛО    │       ЦЕНА         │
└─────────────────────────────────────┘

Controls:
┌─────────────────────────────────────┐
│  [÷2] [÷3] [x1] [x1.5] [x2] [x5]    │
└─────────────────────────────────────┘
```

## Component Hierarchy:

```
RecipeDetailScreen
├── Stack.Screen (headerShown: false)
└── View (flex-1 bg-gray-50)
    └── ScrollView
        ├── Hero Section (ImageBackground)
        │   ├── LinearGradient (overlay)
        │   ├── Top Actions
        │   │   ├── Back Button (ChevronLeft)
        │   │   ├── Favorite Button (Heart)
        │   │   └── Share Button (Share2)
        │   ├── Recipe Title (Text)
        │   ├── BlurView (Nutrition/Weight-Price)
        │   │   └── Display Values
        │   └── BlurView (Control Panel)
        │       ├── Mode Switcher
        │       │   ├── Servings Button
        │       │   └── Quantity Button
        │       └── Mode-specific Controls
        │           ├── Servings Controls
        │           │   ├── Total Weight
        │           │   ├── Counter (-, value, +)
        │           │   └── Portion Weight
        │           └── Quantity Controls
        │               └── Multiplier Buttons
        ├── Tabs (View)
        │   ├── Ingredients Tab
        │   ├── Steps Tab
        │   └── Assembly Tab
        └── Content Area (View)
            ├── Ingredients Content
            │   ├── Add to Shopping List Button
            │   └── Ingredients List
            ├── Steps Content
            │   └── Step-by-step Instructions
            └── Assembly Content
                └── Coming Soon Message
```

## Data Flow:

```
useQuery (Supabase)
    ↓
recipe data + base_recipes
    ↓
Calculate baseValues (memo)
    ↓
  [mode, servings, multiplier] → state
    ↓
Calculate displayValues (memo)
    ↓
Render UI with calculated values
```

## State Management:

```typescript
// UI State
mode: 'servings' | 'quantity'
servings: number (default: 12)
multiplier: number (default: 1)
activeTab: 'ingredients' | 'steps' | 'assembly'
isFavorite: boolean

// Calculated (useMemo)
baseValues: {
  weight, servings,
  calories, fat, protein, carbs, netCarbs
}

displayValues: {
  totalWeight, portionWeight, servingsCount,
  calories, fat, protein, carbs, netCarbs,
  totalPrice (quantity mode only)
}
```

## Color Scheme:

```css
Primary:  #4169E1 (Royal Blue)
Accent:   #50E3C2 (Turquoise)
Success:  #4CAF50 (Green)
White:    #FFFFFF

Glassmorphism:
- Background: rgba(255,255,255,0.2)
- Border: rgba(255,255,255,0.3)
- Blur: 60-80 intensity
```
