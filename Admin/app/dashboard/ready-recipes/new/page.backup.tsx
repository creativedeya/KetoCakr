'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Copy, Save, Sparkles, Upload, X, ImageIcon, FileText } from 'lucide-react';
import Link from 'next/link';

// Types - ADAPTED TO ACTUAL SCHEMA
type DessertType = {
  id: number; // ← SERIAL, not UUID
  name: string;
  name_en: string;
};

type RecipeRole = {
  id: number;
  name: string;
  name_en: string;
};

type BaseRecipe = {
  id: string; // UUID
  name: string;
  recipe_role_id: number;
  compatible_dessert_types: number[]; // ← Array of dessert type IDs
  image_url: string;
  total_weight_grams: number;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  total_net_carbs: number;
};

type ComponentSelection = {
  recipe_role_id: number;
  base_recipe_id: string; // UUID
  order_index: number;
  multiplier: number;
};

type AssemblyTemplate = {
  id: number;
  name: string;
  intro_text_bg: string;
  intro_text_en: string;
};

const ROLE_LABELS: Record<number, string> = {
  1: 'Блат',
  2: 'Крем',
  3: 'Плънка',
  4: 'Декорация'
};

export default function ReadyRecipeBuilder() {
  // State
  const [dessertTypes, setDessertTypes] = useState<DessertType[]>([]);
  const [recipeRoles, setRecipeRoles] = useState<RecipeRole[]>([]);
  const [baseRecipes, setBaseRecipes] = useState<BaseRecipe[]>([]);
  const [templates, setTemplates] = useState<AssemblyTemplate[]>([]);

  // Form State
  const [selectedDessertType, setSelectedDessertType] = useState<number | null>(null); // ← Changed to number
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [components, setComponents] = useState<ComponentSelection[]>([]);
  const [nameEn, setNameEn] = useState('');
  const [nameBg, setNameBg] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionBg, setDescriptionBg] = useState('');
  const [introTextEn, setIntroTextEn] = useState('');
  const [introTextBg, setIntroTextBg] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [isFree, setIsFree] = useState(true);
  const [totalServings, setTotalServings] = useState(12);
  const [tags, setTags] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [costCurrency, setCostCurrency] = useState('EUR');
  const [sellingPrice, setSellingPrice] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('EUR');
  const [calculatingCost, setCalculatingCost] = useState(false);
  // Image Generation State
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [imagePromptDetails, setImagePromptDetails] = useState('');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'components' | 'image' | 'cost'>('info');
  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load base recipes when dessert type changes
  useEffect(() => {
    if (selectedDessertType) {
      loadBaseRecipes(selectedDessertType);
      loadTemplates(selectedDessertType);
    }
  }, [selectedDessertType]);

  // Load template text when template selected
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setIntroTextBg(template.intro_text_bg || '');
        setIntroTextEn(template.intro_text_en || '');
      }
    }
  }, [selectedTemplate, templates]);

  
useEffect(() => {
  if (components.length > 0) {
    calculateRecipeCost();
  } else {
    setEstimatedCost(0);
  }
}, [components]);

  async function loadInitialData() {
    try {
      console.log('🚀 Loading initial data...');
      
      const [dessertTypesRes, rolesRes] = await Promise.all([
        supabase.from('dessert_types').select('*').order('name'),
        supabase.from('recipe_roles').select('*').order('id') // ← No display_order
      ]);

      console.log('✅ Dessert types:', dessertTypesRes);
      console.log('✅ Recipe roles:', rolesRes);

      if (dessertTypesRes.error) {
        console.error('❌ Dessert types error:', dessertTypesRes.error);
      }
      if (rolesRes.error) {
        console.error('❌ Recipe roles error:', rolesRes.error);
      }

      if (dessertTypesRes.data) setDessertTypes(dessertTypesRes.data);
      if (rolesRes.data) setRecipeRoles(rolesRes.data);
      
    } catch (error) {
      console.error('💥 Fatal error loading data:', error);
    }
  }

  async function loadBaseRecipes(dessertTypeId: number) {
    console.log('🔍 Loading base recipes for dessert type:', dessertTypeId);
    
    // Query recipes where compatible_dessert_types array contains dessertTypeId
    const { data, error } = await supabase
      .from('base_recipes')
      .select('*')
      .contains('compatible_dessert_types', [dessertTypeId]) // ← Array contains
      .order('recipe_role_id')
      .order('name');

    console.log('📦 Base recipes loaded:', data?.length || 0, 'recipes');
    if (error) console.error('❌ Error loading base recipes:', error);

    if (data) setBaseRecipes(data);
  }

  async function loadTemplates(dessertTypeId: number) {
    const { data, error } = await supabase
      .from('assembly_templates')
      .select('*')
      .contains('compatible_dessert_types', [dessertTypeId])

    if (error) {
      console.error('❌ Error loading templates:', error);
    }
    if (data) setTemplates(data);
  }

  
async function calculateRecipeCost() {
  if (components.length === 0) {
    setEstimatedCost(0);
    return;
  }

  setCalculatingCost(true);
  
  try {
    let totalCost = 0;
    
    // Calculate cost for each selected component
    for (const component of components) {
      // Skip if no recipe selected
      if (!component.base_recipe_id) continue;
      
      const { data, error } = await supabase
        .rpc('calculate_recipe_cost', {
          p_recipe_id: component.base_recipe_id, // ← FIXED
          p_user_id: null // Admin uses default prices
        });

      if (error) {
        console.warn(`Cost calculation failed for ${component.base_recipe_id}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        const componentCost = data[0].total_cost || 0;
        const multiplier = component.multiplier || 1; // ← FIXED
        totalCost += componentCost * multiplier;
      }
    }

    setEstimatedCost(totalCost);
    
  } catch (error) {
    console.error('Error calculating cost:', error);
  } finally {
    setCalculatingCost(false);
  }
}
  // Component management
  function addComponent(roleId: number) {
    setComponents(prev => [
      ...prev,
      {
        recipe_role_id: roleId,
        base_recipe_id: '',
        order_index: prev.length,
        multiplier: 1
      }
    ]);
  }

  function removeComponent(index: number) {
    setComponents(prev => prev.filter((_, i) => i !== index));
  }

  function updateComponent(index: number, field: keyof ComponentSelection, value: any) {
    setComponents(prev => prev.map((comp, i) => 
      i === index ? { ...comp, [field]: value } : comp
    ));
  }

  function duplicateComponent(index: number) {
    const comp = components[index];
    setComponents(prev => [
      ...prev,
      { ...comp, order_index: prev.length }
    ]);
  }

  function getAvailableRecipes(roleId: number): BaseRecipe[] {
    return baseRecipes.filter(br => br.recipe_role_id === roleId);
  }

  // Calculate total nutrition
  function calculateNutrition() {
    let total = {
      weight: 0,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      netCarbs: 0
    };

    components.forEach(comp => {
      const recipe = baseRecipes.find(br => br.id === comp.base_recipe_id);
      if (recipe) {
        total.weight += (recipe.total_weight_grams || 0) * comp.multiplier;
        total.calories += (recipe.total_calories || 0) * comp.multiplier;
        total.protein += (recipe.total_protein || 0) * comp.multiplier;
        total.fat += (recipe.total_fat || 0) * comp.multiplier;
        total.carbs += (recipe.total_carbs || 0) * comp.multiplier;
        total.netCarbs += (recipe.total_net_carbs || 0) * comp.multiplier;
      }
    });

    return total;
  }

  // Image Generation
  async function handleReferenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setReferenceImages(prev => [...prev, ...files]);

    // Upload to Supabase Storage
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      // Check if bucket exists, if not skip upload
      try {
        const { data, error } = await supabase.storage
          .from('recipe-references')
          .upload(fileName, file);

        if (data) {
          const { data: urlData } = supabase.storage
            .from('recipe-references')
            .getPublicUrl(data.path);
          urls.push(urlData.publicUrl);
        } else if (error) {
          console.warn('⚠️ Storage upload failed (bucket may not exist):', error.message);
        }
      } catch (err) {
        console.warn('⚠️ Storage error:', err);
      }
    }
    if (urls.length > 0) {
      setReferenceUrls(prev => [...prev, ...urls]);
    }
  }

  function removeReference(index: number) {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
    setReferenceUrls(prev => prev.filter((_, i) => i !== index));
  }

  async function generateHeroImage() {
    if (!nameEn) {
      alert('Моля първо попълнете Name (EN)!');
      return;
    }

    setIsGeneratingImage(true);
    setGenerationProgress('Подготовка на prompt...');

    try {
      const componentNames = components
        .map(c => {
          const recipe = baseRecipes.find(br => br.id === c.base_recipe_id);
          return recipe?.name;
        })
        .filter(Boolean)
        .join(', ');

      const dessertType = dessertTypes.find(dt => dt.id === selectedDessertType);

      const fullPrompt = `Professional food photography of ${nameEn}, a keto ${dessertType?.name || 'dessert'}. 
Components: ${componentNames}. 
${imagePromptDetails ? `Additional details: ${imagePromptDetails}` : ''}
Studio lighting, high-end food styling, ultra detailed, appetizing presentation, 
clean white background, shallow depth of field, professional culinary photography.`;

      setGenerationProgress('Генериране на изображение (това отнема 30-60 сек)...');

      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          referenceImages: referenceUrls,
          model: 'flux-pro'
        })
      });

      if (!response.ok) {
        throw new Error('Image generation failed');
      }

      const data = await response.json();
      
      if (data.imageUrl) {
        setHeroImageUrl(data.imageUrl);
        setGenerationProgress('Готово! ✅');
      } else {
        throw new Error('No image URL returned');
      }

    } catch (error) {
      console.error('Image generation error:', error);
      alert('Грешка при генериране: ' + (error as Error).message);
      setGenerationProgress('');
    } finally {
      setIsGeneratingImage(false);
    }
  }

  // Save recipe
  async function saveRecipe() {
    if (!selectedDessertType || !nameEn || components.length === 0) {
      alert('Моля попълнете всички задължителни полета!');
      return;
    }

    const hasInvalidComponents = components.some(c => !c.base_recipe_id);
    if (hasInvalidComponents) {
      alert('Моля изберете базова рецепта за всички компоненти!');
      return;
    }

    setLoading(true);

    try {
      const nutrition = calculateNutrition();
      
      const slug = nameEn
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const tagsArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const recipeData = {
        name_en: nameEn,
        name_bg: nameBg || null,
        slug: slug,
        dessert_type_id: selectedDessertType, // ← Integer now
        assembly_template_id: selectedTemplate,
        selected_components: components,
        description_en: descriptionEn || null,
        description_bg: descriptionBg || null,
        custom_intro_text_en: introTextEn || null,
        custom_intro_text_bg: introTextBg || null,
        difficulty_level: difficulty,
        is_free: isFree,
        total_servings: totalServings,
        total_weight_grams: Math.round(nutrition.weight),
        total_calories: Math.round(nutrition.calories * 10) / 10,
        total_protein: Math.round(nutrition.protein * 10) / 10,
        total_fat: Math.round(nutrition.fat * 10) / 10,
        total_carbs: Math.round(nutrition.carbs * 10) / 10,
        total_net_carbs: Math.round(nutrition.netCarbs * 10) / 10,
        tags: tagsArray.length > 0 ? tagsArray : null,
        hero_image_url: heroImageUrl || null,
        is_featured: isFeatured,
        status: status,
        published_at: status === 'published' ? new Date().toISOString() : null,
estimated_cost: estimatedCost || 0,
  cost_currency: costCurrency,
  selling_price: sellingPrice ? parseFloat(sellingPrice) : null,
  price_currency: priceCurrency,
  cost_calculated_at: estimatedCost > 0 ? new Date().toISOString() : null
      };

     // console.log('💾 Saving recipe:', recipeData);

      console.log('💾 Recipe data to save:', recipeData);
      console.log('💾 selected_components field:', recipeData.selected_components);
      const { data, error } = await supabase
        .from('ready_recipes')
        .insert([recipeData])
        .select()
        .single();

      console.log('✅ Saved data from DB:', data);
      console.log('❌ Error (if any):', error);



      if (error) throw error;

      alert('Рецептата е запазена успешно! ✅');
      resetForm();
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Грешка при запазване: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setNameEn('');
    setNameBg('');
    setDescriptionEn('');
    setDescriptionBg('');
    setIntroTextEn('');
    setIntroTextBg('');
    setComponents([]);
    setSelectedTemplate(null);
    setDifficulty(3);
    setIsFree(true);
    setTotalServings(12);
    setTags('');
    setIsFeatured(false);
    setStatus('draft');
    setHeroImageUrl('');
    setImagePromptDetails('');
    setReferenceImages([]);
    setReferenceUrls([]);
  }

  const nutrition = calculateNutrition();
  const perServing = totalServings > 0 ? {
    calories: Math.round((nutrition.calories / totalServings) * 10) / 10,
    protein: Math.round((nutrition.protein / totalServings) * 10) / 10,
    fat: Math.round((nutrition.fat / totalServings) * 10) / 10,
    carbs: Math.round((nutrition.carbs / totalServings) * 10) / 10,
    netCarbs: Math.round((nutrition.netCarbs / totalServings) * 10) / 10,
  } : { calories: 0, protein: 0, fat: 0, carbs: 0, netCarbs: 0 };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-400">/</span>
        <Link href="/dashboard/ready-recipes" className="text-blue-600 hover:text-blue-700 hover:underline">
          Ready Recipes
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 font-medium">New</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Създаване на Готова Рецепта</h1>
        <p className="text-gray-600">Администраторски режим - пълна гъвкавост + AI генериране</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="inline mr-2" size={18} />
            Информация
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'components'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="inline mr-2" size={18} />
            Компоненти
          </button>
          <button
            onClick={() => setActiveTab('cost')}
            className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'cost'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
            >
            💰 Cost & Pricing
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'image'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ImageIcon className="inline mr-2" size={18} />
            Заглавна Снимка
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* INFO TAB */}
          {activeTab === 'info' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Основна Информация</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Тип Десерт *</label>
                    <select
                      value={selectedDessertType || ''}
                      onChange={(e) => setSelectedDessertType(Number(e.target.value) || null)}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Избери тип...</option>
                      {dessertTypes.map(dt => (
                        <option key={dt.id} value={dt.id}>{dt.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedDessertType && templates.length > 0 && (
                    <div>
                      <label className="block font-medium mb-2">Шаблон (опционално)</label>
                      <select
                        value={selectedTemplate || ''}
                        onChange={(e) => setSelectedTemplate(Number(e.target.value) || null)}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">Без шаблон</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block font-medium mb-2">Име (EN) *</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Classic Chocolate Cake"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Име (BG)</label>
                    <input
                      type="text"
                      value={nameBg}
                      onChange={(e) => setNameBg(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Класическа Шоколадова Торта"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Описание (EN)</label>
                    <textarea
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="A delicious keto-friendly dessert..."
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Описание (BG)</label>
                    <textarea
                      value={descriptionBg}
                      onChange={(e) => setDescriptionBg(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Вкусен кето десерт..."
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Интро Текст (EN)</label>
                    <textarea
                      value={introTextEn}
                      onChange={(e) => setIntroTextEn(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Интро Текст (BG)</label>
                    <textarea
                      value={introTextBg}
                      onChange={(e) => setIntroTextBg(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Tags (разделени със запетая)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="шоколад, торта, кето"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Настройки</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2">Сложност</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(Number(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value={1}>1 - Много лесно</option>
                      <option value={2}>2 - Лесно</option>
                      <option value={3}>3 - Средно</option>
                      <option value={4}>4 - Трудно</option>
                      <option value={5}>5 - Експертно</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Видимост</label>
                    <select
                      value={isFree ? 'free' : 'pro'}
                      onChange={(e) => setIsFree(e.target.value === 'free')}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="free">Free (всички)</option>
                      <option value="pro">Pro Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Порции</label>
                    <input
                      type="number"
                      min="1"
                      value={totalServings}
                      onChange={(e) => setTotalServings(Number(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Статус</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Featured (препоръчано)</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* COMPONENTS TAB */}
          {activeTab === 'components' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Компоненти - Пълна Гъвкавост</h2>
              
              {/* DEBUG INFO */}
              <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
                <p className="font-bold text-yellow-800 mb-2">🔍 DEBUG INFO:</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Selected Dessert Type:</strong> {selectedDessertType || '❌ НЯМА'}</p>
                  <p><strong>Dessert Types Count:</strong> {dessertTypes.length}</p>
                  <p><strong>Base Recipes Count:</strong> {baseRecipes.length}</p>
                  <p><strong>Recipe Roles Count:</strong> {recipeRoles.length}</p>
                  <p><strong>Components Count:</strong> {components.length}</p>
                </div>
              </div>

              {!selectedDessertType ? (
                <div className="p-8 bg-red-50 border-2 border-red-300 rounded-lg text-center">
                  <p className="text-red-700 font-bold text-lg mb-2">⚠️ Няма избран Dessert Type!</p>
                  <p className="text-gray-600 mb-4">
                    Моля върнете се в таба "Информация" и изберете тип десерт.
                  </p>
                  <button
                    onClick={() => setActiveTab('info')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Към Информация
                  </button>
                </div>
              ) : recipeRoles.length === 0 ? (
                <div className="p-8 bg-orange-50 border-2 border-orange-300 rounded-lg">
                  <p className="text-orange-700 font-bold text-lg mb-2">⚠️ Recipe Roles не са заредени!</p>
                </div>
              ) : baseRecipes.length === 0 ? (
                <div className="p-8 bg-orange-50 border-2 border-orange-300 rounded-lg">
                  <p className="text-orange-700 font-bold text-lg mb-2">⚠️ Няма base recipes!</p>
                  <p className="text-gray-600">
                    За dessert type: <strong>{dessertTypes.find(dt => dt.id === selectedDessertType)?.name}</strong>
                  </p>
                </div>
              ) : (
                recipeRoles.map(role => {
                  const roleComponents = components.filter(c => c.recipe_role_id === role.id);
                  const availableRecipes = getAvailableRecipes(role.id);

                  return (
                    <div key={role.id} className="mb-6 p-4 border-2 border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">
                          {ROLE_LABELS[role.id]}
                          <span className="text-sm text-gray-500 ml-2 font-normal">
                            ({availableRecipes.length} налични)
                          </span>
                        </h3>
                        <button
                          onClick={() => addComponent(role.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                        >
                          <Plus size={16} />
                          Добави {ROLE_LABELS[role.id]}
                        </button>
                      </div>

                      {availableRecipes.length === 0 && (
                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                          ⚠️ Няма налични base recipes за {ROLE_LABELS[role.id]}
                        </div>
                      )}

                      {roleComponents.length === 0 ? (
                        <p className="text-gray-400 text-sm italic">Няма избрани компоненти</p>
                      ) : (
                        <div className="space-y-3">
                          {roleComponents.map((comp, idx) => {
                            const globalIndex = components.indexOf(comp);

                            return (
                              <div key={globalIndex} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <select
                                    value={comp.base_recipe_id}
                                    onChange={(e) => updateComponent(globalIndex, 'base_recipe_id', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                  >
                                    <option value="">Избери рецепта...</option>
                                    {availableRecipes.map(br => (
                                      <option key={br.id} value={br.id}>{br.name}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="w-28">
                                  <label className="text-xs text-gray-500 block mb-1">Multiplier</label>
                                  <input
                                    type="number"
                                    min="0.1"
                                    max="5"
                                    step="0.1"
                                    value={comp.multiplier}
                                    onChange={(e) => updateComponent(globalIndex, 'multiplier', parseFloat(e.target.value))}
                                    className="w-full px-2 py-2 border rounded-lg text-center font-mono"
                                  />
                                </div>

                                <button
                                  onClick={() => duplicateComponent(globalIndex)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Дублирай"
                                >
                                  <Copy size={18} />
                                </button>

                                <button
                                  onClick={() => removeComponent(globalIndex)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Изтрий"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* IMAGE TAB */}
          {activeTab === 'image' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">AI Генериране на Заглавна Снимка</h2>
              
              {heroImageUrl && (
                <div className="mb-6">
                  <label className="block font-medium mb-2">Текуща Снимка:</label>
                  <img 
                    src={heroImageUrl} 
                    alt="Hero" 
                    className="w-full h-64 object-cover rounded-lg border-2 border-green-500"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block font-medium mb-2">
                  Уточняващи Думи
                  <span className="text-sm text-gray-500 ml-2">(optional)</span>
                </label>
                <textarea
                  value={imagePromptDetails}
                  onChange={(e) => setImagePromptDetails(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="with chocolate shavings on top, golden lighting"
                />
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-2">Reference Images (optional)</label>
                
                {referenceImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {referenceImages.map((file, idx) => (
                      <div key={idx} className="relative">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Ref ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeReference(idx)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                  <Upload size={20} />
                  <span>Upload Reference Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleReferenceUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={generateHeroImage}
                disabled={isGeneratingImage || !nameEn}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Sparkles size={20} />
                {isGeneratingImage ? generationProgress : 'Генерирай AI Снимка'}
              </button>

              {generationProgress && (
                <p className="mt-3 text-sm text-center text-gray-600">{generationProgress}</p>
              )}
            </div>
          )}

  
{/* ========================================= */}
{/* COST TAB - NEW!                          */}
{/* ========================================= */}
{activeTab === 'cost' && (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold mb-2">💰 Cost & Pricing</h2>
      <p className="text-gray-600">Optional: Calculate costs and set selling price</p>
    </div>

    {/* Cost Calculation */}
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Estimated Cost</h3>
        <button
          type="button"
          onClick={calculateRecipeCost}
          disabled={calculatingCost || components.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
        >
          {calculatingCost ? (
            <>
              <span className="animate-spin">⏳</span>
              Calculating...
            </>
          ) : (
            <>
              🔄 Recalculate
            </>
          )}
        </button>
      </div>

      {estimatedCost > 0 ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Recipe Cost</p>
              <p className="text-3xl font-bold text-blue-600">
                {estimatedCost.toFixed(2)} {costCurrency}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Cost per Serving</p>
              <p className="text-3xl font-bold text-indigo-600">
                {totalServings > 0 
                  ? (estimatedCost / totalServings).toFixed(2) 
                  : '0.00'} {costCurrency}
              </p>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            💡 Cost calculated based on default ingredient prices. 
            Users with custom prices will see different costs.
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-500">
            {components.length === 0 
              ? 'Add components first to calculate cost'
              : 'Click "Recalculate" to estimate cost'}
          </p>
        </div>
      )}
    </div>

    {/* Selling Price */}
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">💵 Selling Price (Optional)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Recipe
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={priceCurrency}
            onChange={(e) => setPriceCurrency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {/* Profit Analysis */}
      {sellingPrice && parseFloat(sellingPrice) > 0 && estimatedCost > 0 && (
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-bold text-green-800 mb-4">📊 Profit Analysis</h4>
          
          {(() => {
            const price = parseFloat(sellingPrice);
            const cost = estimatedCost;
            const profit = price - cost;
            const margin = cost > 0 ? (profit / price) * 100 : 0;
            const profitPerServing = totalServings > 0 ? profit / totalServings : 0;

            return (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Revenue:</span>
                  <span className="font-bold text-green-700">
                    {price.toFixed(2)} {priceCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Cost:</span>
                  <span className="font-bold text-blue-700">
                    {cost.toFixed(2)} {costCurrency}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-300">
                  <span className="font-bold text-gray-800">Profit:</span>
                  <span className={`font-bold text-xl ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profit >= 0 ? '+' : ''}{profit.toFixed(2)} {priceCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Margin:</span>
                  <span className={`font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {margin.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Profit per Serving:</span>
                  <span className="font-bold text-green-600">
                    {profitPerServing.toFixed(2)} {priceCurrency}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        💡 Selling price is optional and for reference only.
      </div>
    </div>
  </div>
)}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {components.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-4">Хранителна Стойност</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Общо тегло:</span>
                  <span className="font-medium">{Math.round(nutrition.weight)}g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Порции:</span>
                  <span className="font-medium">{totalServings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">На порция:</span>
                  <span className="font-medium">{Math.round(nutrition.weight / totalServings)}g</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Калории:</span>
                  <span className="font-medium">{perServing.calories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>Протеини:</span>
                  <span className="font-medium">{perServing.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Мазнини:</span>
                  <span className="font-medium">{perServing.fat}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Въглехидрати:</span>
                  <span className="font-medium">{perServing.carbs}g</span>
                </div>
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Нетни въглехидрати:</span>
                  <span>{perServing.netCarbs}g</span>
                </div>
              </div>
            </div>
          )}

          {components.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-4">Избрани Компоненти ({components.length})</h3>
              <div className="space-y-2 text-sm">
                {components.map((comp, idx) => {
                  const recipe = baseRecipes.find(br => br.id === comp.base_recipe_id);
                  const role = ROLE_LABELS[comp.recipe_role_id];
                  return (
                    <div key={idx} className="flex items-center gap-2 pb-2 border-b last:border-0">
                      <span className="text-gray-400 text-xs">{idx + 1}.</span>
                      <span className="font-medium text-blue-600">{role}:</span>
                      <span className="flex-1 truncate">{recipe?.name || 'N/A'}</span>
                      {comp.multiplier !== 1 && (
                        <span className="text-purple-600 text-xs font-mono bg-purple-50 px-1.5 py-0.5 rounded">
                          x{comp.multiplier}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <button
              onClick={saveRecipe}
              disabled={loading || !nameEn || components.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              <Save size={20} />
              {loading ? 'Запазване...' : 'Запази Рецепта'}
            </button>

            <button
              onClick={resetForm}
              className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Изчисти Формата
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}