
📊 ПЪЛЕН ДОКЛАД ЗА ПРОЕКТА KETOCAKR
Последно обновен: 04.02.2026
 Автор: Deyana
 Цел: Comprehensive project documentation за миграция между сесии

🏗️ АРХИТЕКТУРА НА ПРОЕКТА
Технологичен Stack:
┌─────────────────────────────────────────┐
│         KETOCAKR ECOSYSTEM              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐   ┌──────────────┐   │
│  │   ADMIN      │   │    MOBILE    │   │
│  │   PANEL      │   │     APP      │   │
│  │              │   │              │   │
│  │  Next.js 15  │   │React Native  │   │
│  │  TypeScript  │   │   + Expo     │   │
│  │  TailwindCSS │   │  TypeScript  │   │
│  │              │   │              │   │
│  │  Port: 3000  │   │ Port: 8081   │   │
│  └──────┬───────┘   └──────┬───────┘   │
│         │                  │           │
│         └────────┬─────────┘           │
│                  │                     │
│         ┌────────▼─────────┐           │
│         │    SUPABASE      │           │
│         │   (PostgreSQL)   │           │
│         │                  │           │
│         │  • User Recipes  │           │
│         │  • Base Recipes  │           │
│         │  • Ingredients   │           │
│         │  • Instructions  │           │
│         │  • Nutrition     │           │
│         └──────────────────┘           │
│                                         │
│         ┌──────────────────┐           │
│         │   AI SERVICES    │           │
│         │                  │           │
│         │  • OpenAI GPT    │           │
│         │  • Replicate     │           │
│         │    (Image Gen)   │           │
│         └──────────────────┘           │
└─────────────────────────────────────────┘


📁 ПРОЕКТНА СТРУКТУРА
C:\Dev\KetoCakr\
│
├── .devcontainer/              # Dev Container config
│   ├── devcontainer.json       # VS Code settings
│   ├── docker-compose.yml      # Docker services (ако има)
│   ├── Dockerfile              # Container image (ако има)
│   └── README.md               # Dev Container документация
│
├── admin/                      # Admin Panel (Next.js)
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/                # API routes
│   │   │   ├── recipes/        # Recipe management
│   │   │   ├── generate/       # AI generation
│   │   │   └── images/         # Image processing
│   │   ├── recipes/            # Recipe pages
│   │   ├── base-recipes/       # Base recipe CRUD
│   │   ├── ingredients/        # Ingredient database
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── RecipeBuilder/      # Recipe creation UI
│   │   └── ImageGenerator/     # AI image generation
│   │
│   ├── lib/                    # Utilities
│   │   ├── supabase.ts         # Supabase client
│   │   └── openai.ts           # OpenAI client
│   │
│   ├── public/                 # Static assets
│   ├── styles/                 # CSS files
│   ├── .env.local              # Environment variables
│   ├── package.json            # Dependencies
│   └── tsconfig.json           # TypeScript config
│
├── Mobile/                     # Mobile App (React Native)
│   ├── app/                    # Expo Router screens
│   │   ├── (tabs)/             # Tab navigation
│   │   │   ├── index.tsx       # Home screen
│   │   │   ├── recipes.tsx     # Recipes list
│   │   │   └── profile.tsx     # User profile
│   │   │
│   │   ├── recipe-detail/      # Recipe detail screen
│   │   │   └── [id].tsx        # Dynamic route
│   │   │
│   │   ├── _layout.tsx         # Root layout
│   │   └── +not-found.tsx      # 404 page
│   │
│   ├── components/             # React Native components
│   │   ├── RecipeCard.tsx      # Recipe display
│   │   └── NutritionPanel.tsx  # Nutrition info
│   │
│   ├── lib/                    # Utilities
│   │   ├── supabase.ts         # Supabase client
│   │   └── storage-polyfill.ts # AsyncStorage wrapper
│   │
│   ├── store/                  # State management (Zustand)
│   │   └── useShoppingListStore.ts
│   │
│   ├── assets/                 # Images, fonts
│   ├── .env                    # Environment variables
│   ├── package.json            # Dependencies
│   ├── app.json                # Expo config
│   └── tsconfig.json           # TypeScript config
│
├── Shared/                     # Shared code
│   └── types/                  # TypeScript types
│       ├── index.ts            # Main types export
│       ├── recipe.types.ts     # Recipe types
│       └── database.types.ts   # Supabase types
│
├── Supabase/                   # Database schemas
│   ├── migrations/             # SQL migrations
│   └── seed.sql                # Sample data
│
└── .dockerignore               # Docker ignore


🗄️ DATABASE SCHEMA (Supabase)
Основни таблици:
1. dessert_types
- id: integer (PK)
- name: text
- description: text
- image_url: text
- serves_count: integer

2. recipe_roles
- id: integer (PK)
- name: text (Блат, Крем, Плънка, Декор)
- display_order: integer

3. base_recipes
- id: integer (PK)
- name: text
- description: text
- recipe_role_id: integer (FK → recipe_roles)
- dessert_type_id: integer (FK → dessert_types)
- image_url: text
- bake_temp_celsius: integer
- bake_time_minutes: integer
- total_servings: integer
- total_weight_grams: integer
- total_calories: numeric
- total_protein: numeric
- total_fat: numeric
- total_carbs: numeric
- total_net_carbs: numeric
- created_at: timestamp
- updated_at: timestamp

4. ingredients_database
- id: integer (PK)
- name_en: text
- name_bg: text
- category: text
- unit_weight_grams: numeric (за бр → grams conversion)
- calories_per_100g: numeric
- protein_per_100g: numeric
- fat_per_100g: numeric
- carbs_per_100g: numeric
- fiber_per_100g: numeric
- image_url: text

5. recipe_ingredients
- id: integer (PK)
- recipe_id: integer (FK → base_recipes)
- ingredient_name: text
- quantity: numeric
- unit: text (g, ml, бр, ч.л., с.л.)
- order_index: integer
- created_at: timestamp

6. recipe_instruction_steps
- id: integer (PK)
- recipe_id: integer (FK → base_recipes)
- step_number: integer
- step_description: text
- step_description_bg: text
- step_image_url: text
- step_duration_minutes: integer
- created_at: timestamp

7. assembly_templates
- id: integer (PK)
- dessert_type_id: integer (FK → dessert_types)
- name: text
- intro_text_en: text
- intro_text_bg: text
- created_at: timestamp

8. user_recipes (User-created combinations)
- id: uuid (PK)
- user_id: uuid (FK → auth.users)
- name: text
- dessert_type_id: integer (FK → dessert_types)
- assembly_template_id: integer (FK → assembly_templates)
- selected_components: jsonb
  /* Example:
  [
    { "recipe_role_id": 1, "base_recipe_id": 5 },
    { "recipe_role_id": 2, "base_recipe_id": 12 },
    { "recipe_role_id": 3, "base_recipe_id": 8 },
    { "recipe_role_id": 4, "base_recipe_id": 15 }
  ]
  */
- total_servings: integer
- intro_text: text
- created_at: timestamp
- updated_at: timestamp


🎨 БРАНД ИДЕНТИЧНОСТ "BLAGO"
Цветова палитра:
PRIMARY:   #A80048  (Ruby Red / Cherry)
SECONDARY: #B2AC88  (Warm Beige-Green)
TEXT:      #333333  (Dark Gray)
GRAY:      #666666  (Medium Gray)
LIGHT:     #F5F5F5  (Off-White)
WHITE:     #FFFFFF

Logo Concept:
●Българска дума "БЛАГО" (Blago = Good/Blessing)
●Geometric diamond/star shape
●Ruby red center, beige accents
●Base64 SVG encoded в код

🔧 КЛЮЧОВИ ФУНКЦИОНАЛНОСТИ
Admin Panel (Next.js):
1. Base Recipe Management
●Location: admin/app/base-recipes/
●Features:
○✅ CRUD операции
○✅ Image upload
○✅ Nutrition calculation
○✅ Ingredient management
○✅ Instruction steps с images
○✅ AI-powered step generation (OpenAI)
○✅ Bulk operations
2. Recipe Generator
●Location: admin/app/recipes/create/
●Features:
○✅ Dessert type selection
○✅ Component selection (Блат, Крем, Плънка, Декор)
○✅ "Puzzle" assembly approach
○✅ Auto nutrition calculation
○✅ Preview before save
3. AI Image Generation
●Location: admin/app/api/generate/image/
●Tech: Replicate API (Flux model)
●Features:
○✅ Professional food photography style
○✅ Consistent visual language
○✅ Retry mechanism
○✅ Progress tracking
4. Ingredients Database
●Location: admin/app/ingredients/
●Features:
○✅ Full CRUD
○✅ Image upload
○✅ Nutrition data per 100g
○✅ Unit weight for pieces (бр)
○✅ Bilingual (EN/BG)

Mobile App (React Native):
1. Recipe List Screen
●Location: Mobile/app/(tabs)/recipes.tsx
●Features:
○✅ Grid/List view
○✅ Filter by dessert type
○✅ Search functionality
○✅ Nutrition quick view
2. Recipe Detail Screen ⭐
●Location: Mobile/app/recipe-detail/[id].tsx
●Features:
○✅ Hero image (decoration recipe)
○✅ Dual mode: Servings / Quantity
○✅ Dynamic scaling with multipliers (÷3, ÷2, x1, x1.5, x2, x5)
○✅ Nutrition overlay (calories, protein, fat, carbs)
○✅ Tabbed interface:
■УВОД - Introduction text
■СЪСТАВКИ - Ingredients with images, grouped by role
■СТЪПКИ - Instructions with text/gallery view
■ХРАН. СТОЙ. - Detailed nutrition
○✅ Shopping list integration
○✅ Timer buttons (per step)
○✅ Weight calculations (total & per portion)
○✅ Bulgarian unit translations (г, мл, бр, ч.л., с.л.)
3. Shopping List
●Location: Mobile/store/useShoppingListStore.ts
●Tech: Zustand state management
●Features:
○✅ Add recipe ingredients
○✅ Persistent storage
○✅ Check/uncheck items

🔑 ВАЖНИ КОНЦЕПЦИИ
1. "Puzzle" Recipe Assembly
Всяка торта се състои от 4 компонента:
┌─────────────────┐
│    DECORATION   │  Role ID: 4
├─────────────────┤
│     FILLING     │  Role ID: 3
├─────────────────┤
│      CREAM      │  Role ID: 2
├─────────────────┤
│      CRUST      │  Role ID: 1
└─────────────────┘

Skip options: "без блат", "без крем", etc.
2. Dual Scaling Modes
Servings Mode:
User selects: 8 portions
System calculates:
- Total weight → portion weight
- Ingredients scaled
- Nutrition per portion

Quantity Mode:
User selects: x2 multiplier
System calculates:
- All ingredients doubled
- Total servings adjusted
- Portion weight recalculated

3. Unit Weight System
За съставки измерени в бр (pieces):
// Example: Eggs
{
  name: "Eggs",
  unit_weight_grams: 50,  // 1 egg = 50g
  quantity: 3,
  unit: "бр"
}

// Calculation:
total_weight = 3 * 50 = 150g

4. Nutrition Calculation
// Per portion:
calories_per_portion = total_calories / servings_count

// When scaling:
if (mode === 'servings') {
  nutrition_multiplier = base_servings / current_servings
  displayed_calories = base_calories_per_portion * nutrition_multiplier
}

if (mode === 'quantity') {
  // Nutrition stays per-portion
  // Total weight changes
}


🐛 ИЗВЕСТНИ ПРОБЛЕМИ И РЕШЕНИЯ
Проблем 1: Дублиран recipe query ✅ FIXED
Локация: Mobile/app/recipe-detail/[id].tsx
 Решение: Премахнат дупликат, добавен instructionSteps query
Проблем 2: Dependency conflicts ✅ FIXED
Причина: lucide-react-native vs react-native-svg versions
 Решение: npm install --legacy-peer-deps
Проблем 3: Dev Containers permissions ✅ FIXED
Причина: Windows → Linux filesystem ownership
 Решение: node_modules като Docker volumes
Проблем 4: Missing assembly_template ✅ FIXED
Решение: Added to user_recipes select query

🔐 ENVIRONMENT VARIABLES
Admin (.env.local):
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OpenAI
OPENAI_API_KEY=sk-xxx...

# Replicate
REPLICATE_API_TOKEN=r8_xxx...

Mobile (.env):
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...


📦 KEY DEPENDENCIES
Admin:
{
  "next": "^15.x.x",
  "react": "^18.x.x",
  "typescript": "^5.x.x",
  "@supabase/supabase-js": "^2.x.x",
  "openai": "^4.x.x",
  "replicate": "latest",
  "tailwindcss": "^3.x.x",
  "@tanstack/react-query": "^5.x.x"
}

Mobile:
{
  "expo": "^52.x.x",
  "react-native": "0.76.5",
  "expo-router": "^4.x.x",
  "@supabase/supabase-js": "^2.x.x",
  "@tanstack/react-query": "^5.x.x",
  "zustand": "^4.x.x",
  "lucide-react-native": "^0.307.0",
  "react-native-svg": "15.2.0",
  "nativewind": "^4.x.x"
}


🚀 DEV CONTAINER SETUP
Current Working Config:
File: .devcontainer/devcontainer.json
{
  "name": "KetoCakr Dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye",
  
  "containerUser": "node",
  "remoteUser": "node",
  
  "workspaceFolder": "/workspace",
  
  "mounts": [
    "source=${localWorkspaceFolder},target=/workspace,type=bind",
    "source=ketocakr-admin-node-modules,target=/workspace/admin/node_modules,type=volume",
    "source=ketocakr-mobile-node-modules,target=/workspace/Mobile/node_modules,type=volume"
  ],
  
  "forwardPorts": [3000, 8081],
  
  "postCreateCommand": "npm config set legacy-peer-deps true && cd admin && npm install && cd ../Mobile && npm install"
}

Start Dev Container:
1. Open VS Code
2. File → Open Folder → C:\Dev\KetoCakr
3. Notification: "Reopen in Container" → Click
4. Wait ~10 minutes (first time)
5. Ready! ✅

Daily Usage:
# Terminal 1
cd admin
npm run dev
# → http://localhost:3000

# Terminal 2
cd Mobile
npx expo start
# → Scan QR code


📝 CODING STANDARDS
TypeScript:
●✅ Strict mode enabled
●✅ Shared types in /Shared/types/
●✅ No any types
Naming:
●Components: PascalCase (RecipeCard.tsx)
●Files: kebab-case (recipe-detail.tsx)
●Functions: camelCase (calculateNutrition)
●Constants: UPPER_SNAKE_CASE (COLORS)
Database:
●Tables: snake_case (base_recipes)
●Columns: snake_case (recipe_role_id)
●Foreign keys: {table}_id format

🎯 ROADMAP & TODO
Phase 1: MVP ✅ (Текущо състояние)
●[x] Database schema
●[x] Admin panel base recipes CRUD
●[x] Mobile recipe viewer
●[x] Nutrition calculation
●[x] Recipe assembly
●[x] Dev environment stable
Phase 2: AI Enhancement 🚧 (В процес)
●[x] AI instruction generation (OpenAI)
●[x] AI image generation (Replicate)
●[ ] Image consistency across steps
●[ ] Bulgarian language support for AI
Phase 3: User Features (Планирано)
●[ ] User authentication
●[ ] Favorites system
●[ ] Shopping list cloud sync
●[ ] Recipe sharing
●[ ] Comments & ratings
Phase 4: Physical Business (Бъдеще)
●[ ] "blago cake" брандинг финализиран
●[ ] Order management system
●[ ] Delivery integration
●[ ] Customer app features

🔄 GIT WORKFLOW
Branches:
main           - Production ready
dev            - Development branch
feature/*      - New features
fix/*          - Bug fixes

Commit Convention:
feat: Add recipe scaling modes
fix: Resolve permissions error in dev container
docs: Update project documentation
refactor: Simplify nutrition calculation


🆘 TROUBLESHOOTING GUIDE
Issue: "Cannot find module"
cd admin  # or Mobile
rm -rf node_modules .next
npm install

Issue: Expo won't start
cd Mobile
npx expo start --clear

Issue: Dev Container permissions
sudo chown -R node:node /workspace

Issue: Port already in use
# Find process
lsof -i :3000
# Kill it
kill -9 <PID>


🧹 КАК ДА ИЗЧИСТИШ КЕШ-А НА ТАЗИ СЕСИЯ
Вариант 1: Олекоти Current Session
В Claude Chat Interface:
Не може директно да изтриеш history, но можеш:
1.Start New Topic:

○Click "New chat" button
○Reference тази conversation с link ако трябва
2.Summarize Critical Info:

○Copy този доклад
○Save в Notion/Google Docs
○Start fresh chat с summary

Вариант 2: Export & Archive
Export Conversation:
1.Manual Copy:

○Select important parts
○Paste в document
○Save като reference
Key Info to Save:

 - devcontainer.json config
- Database schema
- Project structure
- Environment variables template
- Troubleshooting commands
2.

Вариант 3: Create Project Brief
Минимален context за нова сесия:
# KetoCakr Quick Context

## Stack:
- Admin: Next.js 15 + TypeScript + Supabase
- Mobile: React Native + Expo + TypeScript
- DB: Supabase (PostgreSQL)

## Current State:
- Dev Container: ✅ Working
- Admin Panel: ✅ Running on :3000
- Mobile App: ✅ Running on :8081

## Last Working On:
- Recipe detail screen scaling modes
- AI image generation integration

## To Continue:
1. Open in Dev Container
2. `cd admin && npm run dev`
3. `cd Mobile && npx expo start`

## Docs:
[Link to this full report]


📋 MIGRATION CHECKLIST
Когато мигрираш към нова Claude сесия:
Подготовка:
●[ ] Save този доклад
●[ ] Export .devcontainer/ config
●[ ] Note текущ git commit hash
●[ ] List активни branches
●[ ] Screenshot на working app
В новата сесия казвай:
"Работя на KetoCakr проект. 

Tech stack: Next.js admin panel + React Native mobile app + Supabase.

Текущо: Dev Container работи, recipe detail screen с scaling modes.

Имам пълен доклад, искам да продължа работа върху [конкретна задача].


🎊 STATUS SUMMARY
✅ РАБОТИ:
●Dev Container environment
●Admin panel (Next.js)
●Mobile app (React Native)
●Database schema
●Recipe CRUD
●AI image generation
●Nutrition calculations
●Recipe detail screen
●Shopping list
🚧 В ПРОЦЕС:
●Image consistency за steps
●Bulgarian AI prompts
●User authentication
📅 ПЛАНИРАНО:
●Cloud sync
●Recipe sharing
●Physical business integration

🎯 NEXT SESSION FOCUS
Препоръчвам следващата сесия да се фокусираме на:
1.Image Consistency за recipe steps
2.Bulgarian Language support за AI
3.User Auth implementation
4.Cloud Sync за shopping list

Този доклад е comprehensive reference за целия проект! Save го и използвай за миграция! 📚✨
За clean session:
1.Copy този доклад → Save external
2.Start new chat
3.Paste relevant summary
4.Continue работа! 🚀
