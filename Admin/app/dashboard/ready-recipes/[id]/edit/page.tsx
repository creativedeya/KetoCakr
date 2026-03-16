'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Copy, Save, Sparkles, Upload, X, ImageIcon, FileText, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Types - same as create page
type DessertType = {
  id: number;
  name: string;
  name_en: string;
};

type RecipeRole = {
  id: number;
  name: string;
  name_en: string;
};

type BaseRecipe = {
  id: string;
  name: string;
  recipe_role_id: number;
  compatible_dessert_types: number[];
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
  base_recipe_id: string;
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

export default function ReadyRecipeEdit() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;

  // State
  const [dessertTypes, setDessertTypes] = useState<DessertType[]>([]);
  const [recipeRoles, setRecipeRoles] = useState<RecipeRole[]>([]);
  const [baseRecipes, setBaseRecipes] = useState<BaseRecipe[]>([]);
  const [templates, setTemplates] = useState<AssemblyTemplate[]>([]);

  // Form State
  const [selectedDessertType, setSelectedDessertType] = useState<number | null>(null);
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

  // Image State
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [imagePromptDetails, setImagePromptDetails] = useState('');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Cost State
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [costCurrency, setCostCurrency] = useState('EUR');
  const [sellingPrice, setSellingPrice] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('EUR');
  const [calculatingCost, setCalculatingCost] = useState(false);

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'components' | 'image' | 'cost'>('info');

  // Load recipe on mount
  useEffect(() => {
    loadInitialData();
    loadRecipe();
  }, [recipeId]);

  // Load base recipes when dessert type changes
  useEffect(() => {
    if (selectedDessertType) {
      loadBaseRecipes(selectedDessertType);
      loadTemplates(selectedDessertType);
    }
  }, [selectedDessertType]);

  // Recalculate cost when components change
  useEffect(() => {
    if (components.length > 0) {
      calculateRecipeCost();
    } else {
      setEstimatedCost(0);
    }
  }, [components]);

  async function loadInitialData() {
    try {
      const [dessertTypesRes, rolesRes] = await Promise.all([
        supabase.from('dessert_types').select('*').order('name'),
        supabase.from('recipe_roles').select('*').order('id')
      ]);

      if (dessertTypesRes.data) setDessertTypes(dessertTypesRes.data);
      if (rolesRes.data) setRecipeRoles(rolesRes.data);
      
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  async function loadRecipe() {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('ready_recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) throw error;

      if (data) {
        // Set form fields
        setNameEn(data.name_en || '');
        setNameBg(data.name_bg || '');
        setDescriptionEn(data.description_en || '');
        setDescriptionBg(data.description_bg || '');
        setIntroTextEn(data.custom_intro_text_en || '');
        setIntroTextBg(data.custom_intro_text_bg || '');
        setSelectedDessertType(data.dessert_type_id);
        setSelectedTemplate(data.assembly_template_id);
        setComponents(data.selected_components || []);
        setDifficulty(data.difficulty_level || 3);
        setIsFree(data.is_free ?? true);
        setTotalServings(data.total_servings || 12);
        setTags(data.tags?.join(', ') || '');
        setIsFeatured(data.is_featured || false);
        setStatus(data.status || 'draft');
        setHeroImageUrl(data.hero_image_url || '');
        setEstimatedCost(data.estimated_cost || 0);
        setCostCurrency(data.cost_currency || 'EUR');
        setSellingPrice(data.selling_price?.toString() || '');
        setPriceCurrency(data.price_currency || 'EUR');

        console.log('✅ Recipe loaded:', data.name_en);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      alert('Грешка при зареждане на рецептата!');
    } finally {
      setLoading(false);
    }
  }

  async function loadBaseRecipes(dessertTypeId: number) {
    const { data, error } = await supabase
      .from('base_recipes')
      .select('*')
      .contains('compatible_dessert_types', [dessertTypeId])
      .order('recipe_role_id')
      .order('name');

    if (error) console.error('Error loading base recipes:', error);
    if (data) setBaseRecipes(data);
  }

  async function loadTemplates(dessertTypeId: number) {
    try {
      const { data, error } = await supabase
        .from('assembly_templates')
        .select('*')
        .contains('compatible_dessert_types', [dessertTypeId]);

      if (error) {
        console.warn('Templates not available');
        setTemplates([]);
        return;
      }
      if (data) setTemplates(data);
    } catch (err) {
      setTemplates([]);
    }
  }

  async function calculateRecipeCost() {
    if (components.length === 0) {
      setEstimatedCost(0);
      return;
    }

    console.log('💰 START COST CALC — components:', JSON.stringify(components));
    setCalculatingCost(true);

    try {
      let totalCost = 0;

      for (const component of components) {
        if (!component.base_recipe_id) continue;

        const multiplier = component.multiplier || 1;
        let compCost = 0;

        // 1. Try RPC first
        const { data: rpcData, error: rpcError } = await supabase.rpc('calculate_recipe_cost', {
          p_recipe_id: component.base_recipe_id,
          p_user_id: null,
        });
        console.log('💰 RPC raw response:', JSON.stringify(rpcData), 'error:', rpcError);

        if (!rpcError) {
          const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
          compCost = result?.total_cost ?? 0;
        } else {
          // 2. Fallback: calculate from recipe_ingredients
          const { data: ingredients, error: ingError } = await supabase
            .from('recipe_ingredients')
            .select('quantity, unit, ingredients_database!inner(default_price, price_unit)')
            .eq('recipe_id', component.base_recipe_id);

          if (ingError || !ingredients) {
            console.error('❌ Fallback failed for', component.base_recipe_id, ingError);
            alert(`Неуспешно изчисляване на цена за рецепта ${component.base_recipe_id}. Провери конзолата.`);
            continue;
          }

          for (const ing of ingredients) {
            const db = ing.ingredients_database as unknown as { default_price: number; price_unit: string } | null;
            if (!db) continue;
            const qty = ing.quantity ?? 0;
            const price = db.default_price ?? 0;
            const unit = db.price_unit ?? '';
            if (unit === 'kg' || unit === 'l') {
              compCost += (qty / 1000) * price;
            } else {
              compCost += qty * price;
            }
          }
        }

        const finalCost = compCost * multiplier;
        console.log(`💰 Component cost: ${compCost} × ${multiplier} = ${finalCost}`);
        totalCost += finalCost;
      }

      console.log('💰 TOTAL:', totalCost);
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

  // Calculate nutrition
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

  // Direct Image Upload
  async function handleDirectImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${recipeId}-hero-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(data.path);

      setHeroImageUrl(urlData.publicUrl);
      alert('Снимката е качена успешно! ✅');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Грешка при качване: ' + (error as Error).message);
    } finally {
      setUploadingImage(false);
    }
  }

  // Reference Images
  async function handleReferenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setReferenceImages(prev => [...prev, ...files]);

    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('recipe-references')
          .upload(fileName, file);

        if (data) {
          const { data: urlData } = supabase.storage
            .from('recipe-references')
            .getPublicUrl(data.path);
          urls.push(urlData.publicUrl);
        }
      } catch (err) {
        console.warn('Reference upload failed:', err);
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

  // AI Image Generation
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

      setGenerationProgress('Генериране... (30-60 сек)');

      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          referenceImages: referenceUrls,
          model: 'flux-pro'
        })
      });

      if (!response.ok) throw new Error('Image generation failed');

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

  // Update recipe
  async function updateRecipe() {
    if (!selectedDessertType || !nameEn || components.length === 0) {
      alert('Моля попълнете всички задължителни полета!');
      return;
    }

    const hasInvalidComponents = components.some(c => !c.base_recipe_id);
    if (hasInvalidComponents) {
      alert('Моля изберете базова рецепта за всички компоненти!');
      return;
    }

    setSaving(true);

    try {
      const nutrition = calculateNutrition();
      
      const slug = nameEn
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const { data: existing } = await supabase
        .from('ready_recipes')
        .select('id')
        .eq('slug', slug)
        .neq('id', recipeId || '')
        .maybeSingle();

      if (existing) {
        alert('⚠️ Рецепта с това име вече съществува! Моля, изберете друго име.');
        return;
      }

      const tagsArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const recipeData = {
        name_en: nameEn,
        name_bg: nameBg || null,
        slug: slug,
        dessert_type_id: selectedDessertType,
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
        published_at: status === 'published' && !heroImageUrl
          ? new Date().toISOString()
          : undefined,
        updated_at: new Date().toISOString(),
        estimated_cost: estimatedCost,
        cost_currency: costCurrency,
        selling_price: sellingPrice ? parseFloat(sellingPrice) : null,
        price_currency: priceCurrency,
        cost_calculated_at: estimatedCost > 0 ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('ready_recipes')
        .update(recipeData)
        .eq('id', recipeId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Updated successfully:', data?.id);
      alert('Рецептата е обновена успешно! ✅');
      console.log('🔄 Redirecting to /dashboard/ready-recipes');
      router.push('/dashboard/ready-recipes');
      
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Грешка при запазване: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const nutrition = calculateNutrition();
  const perServing = totalServings > 0 ? {
    calories: Math.round((nutrition.calories / totalServings) * 10) / 10,
    protein: Math.round((nutrition.protein / totalServings) * 10) / 10,
    fat: Math.round((nutrition.fat / totalServings) * 10) / 10,
    carbs: Math.round((nutrition.carbs / totalServings) * 10) / 10,
    netCarbs: Math.round((nutrition.netCarbs / totalServings) * 10) / 10,
  } : { calories: 0, protein: 0, fat: 0, carbs: 0, netCarbs: 0 };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Зареждане на рецепта...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb + Back Navigation */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/dashboard/ready-recipes" className="text-blue-600 hover:text-blue-700 hover:underline">
            Ready Recipes
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-medium">Edit</span>
        </nav>
        
        <Link 
          href="/dashboard/ready-recipes"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          Назад към списъка
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Редакция на Рецепта</h1>
        <p className="text-gray-600">{nameEn || 'Без име'}</p>
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
          <button
            onClick={() => setActiveTab('cost')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'cost'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💰 Cost
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Same as create page */}
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
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Име (BG)</label>
                    <input
                      type="text"
                      value={nameBg}
                      onChange={(e) => setNameBg(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Описание (EN)</label>
                    <textarea
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Описание (BG)</label>
                    <textarea
                      value={descriptionBg}
                      onChange={(e) => setDescriptionBg(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg"
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
                    <label className="block font-medium mb-2">Tags</label>
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
                      <option value="free">Free</option>
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
                    <span className="font-medium">Featured</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* COMPONENTS TAB - Same as create */}
          {activeTab === 'components' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Компоненти</h2>
              
              {!selectedDessertType ? (
                <div className="p-8 bg-red-50 border-2 border-red-300 rounded-lg text-center">
                  <p className="text-red-700 font-bold mb-2">⚠️ Няма избран Dessert Type!</p>
                  <button
                    onClick={() => setActiveTab('info')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Към Информация
                  </button>
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
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          <Plus size={16} />
                          Добави
                        </button>
                      </div>

                      {roleComponents.length === 0 ? (
                        <p className="text-gray-400 text-sm italic">Няма компоненти</p>
                      ) : (
                        <div className="space-y-3">
                          {roleComponents.map((comp) => {
                            const globalIndex = components.indexOf(comp);
                            return (
                              <div key={globalIndex} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <select
                                    value={comp.base_recipe_id}
                                    onChange={(e) => updateComponent(globalIndex, 'base_recipe_id', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                  >
                                    <option value="">Избери...</option>
                                    {availableRecipes.map(br => (
                                      <option key={br.id} value={br.id}>{br.name}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="w-28">
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={comp.multiplier}
                                    onChange={(e) => updateComponent(globalIndex, 'multiplier', parseFloat(e.target.value))}
                                    className="w-full px-2 py-2 border rounded-lg text-center"
                                  />
                                </div>

                                <button
                                  onClick={() => duplicateComponent(globalIndex)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                  <Copy size={18} />
                                </button>

                                <button
                                  onClick={() => removeComponent(globalIndex)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

          {/* COST TAB */}
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
                      <>🔄 Recalculate</>
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
                            <span className="font-bold text-green-700">{price.toFixed(2)} {priceCurrency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Cost:</span>
                            <span className="font-bold text-blue-700">{cost.toFixed(2)} {costCurrency}</span>
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
                            <span className="font-bold text-green-600">{profitPerServing.toFixed(2)} {priceCurrency}</span>
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

          {/* IMAGE TAB - With Direct Upload */}
          {activeTab === 'image' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Заглавна Снимка</h2>
              
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

              {/* Direct Upload Section */}
              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="font-bold mb-3">📤 Качи Директно Снимка</h3>
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-400 rounded-lg hover:border-blue-600 cursor-pointer bg-white">
                  <Upload size={20} />
                  <span>{uploadingImage ? 'Качване...' : 'Избери Файл'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDirectImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  JPG, PNG, WEBP - до 5MB
                </p>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ИЛИ</span>
                </div>
              </div>

              {/* AI Generation Section */}
              <div className="mb-4">
                <label className="block font-medium mb-2">AI Генериране - Уточняващи Думи</label>
                <textarea
                  value={imagePromptDetails}
                  onChange={(e) => setImagePromptDetails(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="with chocolate shavings, golden lighting..."
                />
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-2">Reference Images</label>
                
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
                  <span>Upload References</span>
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
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 font-medium"
              >
                <Sparkles size={20} />
                {isGeneratingImage ? generationProgress : 'Генерирай AI Снимка'}
              </button>
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
                  <span>Нетни:</span>
                  <span>{perServing.netCarbs}g</span>
                </div>
              </div>

              <hr className="my-3" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-bold text-base">
                  <span>💰 Цена на десерт:</span>
                  <span className="text-blue-600">
                    {estimatedCost > 0 ? `${estimatedCost.toFixed(2)} EUR` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>🍰 Цена на парче:</span>
                  <span>
                    {estimatedCost > 0 && totalServings > 0
                      ? `${(estimatedCost / totalServings).toFixed(2)} EUR`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <button
              onClick={updateRecipe}
              disabled={saving || !nameEn || components.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 font-medium"
            >
              <Save size={20} />
              {saving ? 'Запазване...' : 'Запази Промените'}
            </button>

            <Link
              href="/dashboard/ready-recipes"
              className="block w-full px-4 py-2 text-center text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Отказ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}