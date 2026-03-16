'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  name_en: string;
}

interface Ingredient {
  id: string;
  name_en: string;
  name_bg: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  fiber_per_100g: number;
  default_unit: string;
  default_price?: number | null;
  default_currency?: string | null;
  price_unit?: string | null;
  unit_weight_grams?: number | null;
  category_id: number | null;
  image_url: string | null;
  aliases: string[];
  ingredient_categories?: Category;
}

interface RecipeUsage {
  id: number;
  quantity: number;
  unit: string;
  ingredient_name: string;
  ingredient_database_id: string | null;
  recipe: {
    id: string;
    name: string;
    recipe_role_id: number;
    role: { name: string } | null;
  } | null;
}

interface IngredientWithCount extends Ingredient {
  recipeCount: number;
}

export default function IngredientsPage() {
  // ─── Existing State ───────────────────────────────────────────
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name_en: '',
    name_bg: '',
    calories_per_100g: 0,
    protein_per_100g: 0,
    fat_per_100g: 0,
    carbs_per_100g: 0,
    fiber_per_100g: 0,
    default_unit: 'g',
    default_price: '0',
    default_currency: 'EUR',
    price_unit: 'kg',
    unit_weight_grams: '',
    category_id: '',
    image_url: '',
    aliases: '',
  });

  // ─── New State ────────────────────────────────────────────────
  const [usageCounts, setUsageCounts] = useState<Map<string, number>>(new Map());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ingredientUsages, setIngredientUsages] = useState<RecipeUsage[]>([]);
  const [loadingUsages, setLoadingUsages] = useState(false);
  const [rightTab, setRightTab] = useState<'list' | 'duplicates'>('list');

  // Duplicates
  const [dupSearch, setDupSearch] = useState('');
  const [dupResults, setDupResults] = useState<IngredientWithCount[]>([]);
  const [searchingDups, setSearchingDups] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [sourceIds, setSourceIds] = useState<Set<string>>(new Set());
  const [merging, setMerging] = useState(false);

  // Link ingredient_database_id to a recipe_ingredient
  const [linkingUsageId, setLinkingUsageId] = useState<number | null>(null);
  const [linkSearch, setLinkSearch] = useState('');

  useEffect(() => {
    checkAuth();
    loadCategories();
    loadIngredients();
    loadUsageCounts();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/login');
  }

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('ingredient_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function loadIngredients() {
    try {
      const { data, error } = await supabase
        .from('ingredients_database')
        .select(`
          *,
          ingredient_categories (
            id,
            name,
            name_en
          )
        `)
        .order('name_bg');
      if (error) throw error;
      setIngredients(data || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
      alert('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  }

  async function loadUsageCounts() {
    const { data } = await supabase
      .from('recipe_ingredients')
      .select('ingredient_database_id')
      .not('ingredient_database_id', 'is', null);

    const countMap = new Map<string, number>();
    data?.forEach(ri => {
      const id = ri.ingredient_database_id as string;
      countMap.set(id, (countMap.get(id) || 0) + 1);
    });
    setUsageCounts(countMap);
  }

  async function loadIngredientUsages(ingredientId: string) {
    setLoadingUsages(true);
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .select('id, quantity, unit, ingredient_name, ingredient_database_id, recipe:base_recipes(id, name, recipe_role_id, role:recipe_roles(name))')
      .eq('ingredient_database_id', ingredientId);
    if (error) console.error('Error loading usages:', error);
    setIngredientUsages((data || []) as unknown as RecipeUsage[]);
    setLoadingUsages(false);
  }

  function handleExpandIngredient(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      setIngredientUsages([]);
      setLinkingUsageId(null);
      setLinkSearch('');
      return;
    }
    setExpandedId(id);
    setLinkingUsageId(null);
    setLinkSearch('');
    loadIngredientUsages(id);
  }

  async function searchDuplicates() {
    if (!dupSearch.trim()) return;
    setSearchingDups(true);
    setTargetId(null);
    setSourceIds(new Set());

    const { data } = await supabase
      .from('ingredients_database')
      .select('*')
      .or(`name_bg.ilike.%${dupSearch}%,name_en.ilike.%${dupSearch}%`)
      .order('name_bg');

    const results = (data || []).map(ing => ({
      ...ing,
      recipeCount: usageCounts.get(ing.id) || 0,
    })) as IngredientWithCount[];

    setDupResults(results);
    setSearchingDups(false);
  }

  function selectTarget(id: string) {
    setTargetId(id);
    const newSet = new Set(sourceIds);
    newSet.delete(id);
    setSourceIds(newSet);
  }

  function toggleSource(id: string) {
    if (id === targetId) return;
    const newSet = new Set(sourceIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSourceIds(newSet);
  }

  async function handleMerge() {
    if (!targetId || sourceIds.size === 0) {
      alert('Изберете "правилна" съставка (● ЗАПАЗИ) и поне един дубликат (☑ ИЗТРИЙ)');
      return;
    }

    const sourceIdsArray = Array.from(sourceIds);
    const targetName = dupResults.find(r => r.id === targetId)?.name_bg;
    const sourceNames = sourceIdsArray
      .map(id => dupResults.find(r => r.id === id)?.name_bg)
      .join('", "');
    const totalCount = sourceIdsArray.reduce((sum, id) => sum + (usageCounts.get(id) || 0), 0);

    const confirmed = confirm(
      `Ще пренасочите ${totalCount} записа от "${sourceNames}" към "${targetName}".\n` +
      `След това "${sourceNames}" ще бъдат ИЗТРИТИ.\n\n` +
      `Продължавате ли?`
    );
    if (!confirmed) return;

    setMerging(true);

    for (const sourceId of sourceIdsArray) {
      const { error } = await supabase
        .from('recipe_ingredients')
        .update({ ingredient_database_id: targetId })
        .eq('ingredient_database_id', sourceId);

      if (error) {
        alert(`Грешка при пренасочване от ${sourceId}: ${error.message}`);
        setMerging(false);
        return;
      }
    }

    const { error: deleteError } = await supabase
      .from('ingredients_database')
      .delete()
      .in('id', sourceIdsArray);

    if (deleteError) {
      alert(`Грешка при изтриване: ${deleteError.message}`);
      setMerging(false);
      return;
    }

    alert('Успешно обединени! ✅');
    setMerging(false);
    setTargetId(null);
    setSourceIds(new Set());
    setDupResults([]);
    setDupSearch('');
    loadIngredients();
    loadUsageCounts();
  }

  async function linkRecipeIngredient(recipeIngredientId: number, ingredientDatabaseId: string) {
    const { error } = await supabase
      .from('recipe_ingredients')
      .update({ ingredient_database_id: ingredientDatabaseId })
      .eq('id', recipeIngredientId);

    if (error) {
      alert(`Грешка: ${error.message}`);
      return;
    }

    setLinkingUsageId(null);
    setLinkSearch('');
    if (expandedId) loadIngredientUsages(expandedId);
    loadUsageCounts();
  }

  async function updateIngredientName(recipeIngredientId: number, ingredientDatabaseId: string) {
    const { data, error } = await supabase
      .from('ingredients_database')
      .select('name_en, name_bg')
      .eq('id', ingredientDatabaseId)
      .single();

    if (error || !data) {
      alert('Грешка при зареждане на съставката');
      return;
    }

    const { error: updateError } = await supabase
      .from('recipe_ingredients')
      .update({ ingredient_name: data.name_en })
      .eq('id', recipeIngredientId);

    if (updateError) {
      alert(`Грешка: ${updateError.message}`);
      return;
    }

    if (expandedId) loadIngredientUsages(expandedId);
  }

  // ─── Existing Image Upload Functions ─────────────────────────
  async function uploadImage(file: File) {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const safeName = formData.name_en.toLowerCase().replace(/\s+/g, '-') || 'ingredient';
      const fileName = `${safeName}-${Date.now()}.${fileExt}`;
      const filePath = `ingredients/${fileName}`;

      const { error } = await supabase.storage
        .from('ingredient-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('ingredient-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      alert('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  function handleImageDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    } else {
      alert('Please upload an image file');
    }
  }

  function handleImageInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
  }

  function resetForm() {
    setFormData({
      name_en: '', name_bg: '',
      calories_per_100g: 0, protein_per_100g: 0,
      fat_per_100g: 0, carbs_per_100g: 0, fiber_per_100g: 0,
      default_unit: 'g', default_price: '0', default_currency: 'EUR',
      price_unit: 'kg', unit_weight_grams: '', category_id: '',
      image_url: '', aliases: '',
    });
    setEditingId(null);
  }

  function handleEdit(ingredient: Ingredient) {
    setFormData({
      name_en: ingredient.name_en,
      name_bg: ingredient.name_bg,
      calories_per_100g: ingredient.calories_per_100g,
      protein_per_100g: ingredient.protein_per_100g,
      fat_per_100g: ingredient.fat_per_100g,
      carbs_per_100g: ingredient.carbs_per_100g,
      fiber_per_100g: ingredient.fiber_per_100g,
      default_unit: ingredient.default_unit,
      default_price: ingredient.default_price?.toString() ?? '0',
      default_currency: ingredient.default_currency ?? 'EUR',
      price_unit: ingredient.price_unit ?? 'kg',
      unit_weight_grams: ingredient.unit_weight_grams?.toString() ?? '',
      category_id: ingredient.category_id?.toString() || '',
      image_url: ingredient.image_url || '',
      aliases: ingredient.aliases?.join(', ') || '',
    });
    setEditingId(ingredient.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name_en || !formData.name_bg) {
      alert('Please fill in English and Bulgarian names');
      return;
    }

    const dataToSave = {
      name_en: formData.name_en,
      name_bg: formData.name_bg,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      image_url: formData.image_url || null,
      aliases: formData.aliases.split(',').map(a => a.trim()).filter(Boolean),
      calories_per_100g: parseFloat(formData.calories_per_100g as any) || 0,
      protein_per_100g: parseFloat(formData.protein_per_100g as any) || 0,
      fat_per_100g: parseFloat(formData.fat_per_100g as any) || 0,
      carbs_per_100g: parseFloat(formData.carbs_per_100g as any) || 0,
      fiber_per_100g: parseFloat(formData.fiber_per_100g as any) || 0,
      default_unit: formData.default_unit || 'g',
      unit_weight_grams: formData.unit_weight_grams ? parseFloat(formData.unit_weight_grams as any) : null,
      updated_at: new Date().toISOString(),
      default_price: parseFloat(formData.default_price as any) || 0,
      default_currency: formData.default_currency || 'EUR',
      price_unit: formData.price_unit || 'kg',
      last_price_update: new Date().toISOString(),
    };

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('ingredients_database')
          .update(dataToSave)
          .eq('id', editingId)
          .select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Update failed - no rows affected');
        alert('Ingredient updated! ✅');
      } else {
        const { data, error } = await supabase
          .from('ingredients_database')
          .insert(dataToSave)
          .select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Insert failed - no rows created');
        alert('Ingredient created! ✅');
      }
      resetForm();
      loadIngredients();
    } catch (error: any) {
      console.error('❌ Error saving ingredient:', error);
      alert(error?.message || error?.details || JSON.stringify(error) || 'Failed to save ingredient');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this ingredient? This cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('ingredients_database')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('Ingredient deleted!');
      loadIngredients();
      loadUsageCounts();
    } catch (error: any) {
      console.error('Error deleting ingredient:', error);
      alert(error.message || 'Failed to delete ingredient');
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
      setShowImportModal(true);
    };
    reader.readAsText(file);
  }

  async function handleImportCSV() {
    if (!importText.trim()) { alert('No CSV data to import'); return; }
    setImporting(true);
    try {
      const lines = importText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['name_bg', 'name_en', 'category_id', 'calories_per_100g',
        'protein_per_100g', 'fat_per_100g', 'carbs_per_100g', 'fiber_per_100g'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        alert(`Missing required columns: ${missingHeaders.join(', ')}`);
        setImporting(false);
        return;
      }
      const ingredientsToImport = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',').map(v => v.trim());
        const ingredient: any = {};
        headers.forEach((header, index) => {
          const value = values[index];
          if (header === 'category_id') {
            ingredient[header] = value ? parseInt(value) : null;
          } else if (['calories_per_100g', 'protein_per_100g', 'fat_per_100g',
            'carbs_per_100g', 'fiber_per_100g'].includes(header)) {
            ingredient[header] = parseFloat(value) || 0;
          } else if (header === 'aliases') {
            ingredient[header] = value ? value.split('|').map(a => a.trim()) : [];
          } else {
            ingredient[header] = value || null;
          }
        });
        if (!ingredient.default_unit) ingredient.default_unit = 'g';
        ingredientsToImport.push(ingredient);
      }
      const { error } = await supabase.from('ingredients_database').insert(ingredientsToImport);
      if (error) throw error;
      alert(`Successfully imported ${ingredientsToImport.length} ingredients!`);
      setShowImportModal(false);
      setImportText('');
      loadIngredients();
      loadUsageCounts();
    } catch (error: any) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  }

  function downloadCSVTemplate() {
    const template = `name_bg,name_en,category_id,calories_per_100g,protein_per_100g,fat_per_100g,carbs_per_100g,fiber_per_100g,default_unit,image_url,aliases
Бадемово брашно,Almond flour,1,571,21,50,6,10,g,https://example.com/almond.jpg,миндално брашно|almond meal
Кокосово брашно,Coconut flour,1,354,18,9,58,38,g,https://example.com/coconut.jpg,coconut powder`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ingredients_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ─── Computed ─────────────────────────────────────────────────
  const filteredIngredients = ingredients.filter(ing =>
    ing.name_bg.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.name_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLinkIngredients = ingredients
    .filter(ing =>
      ing.name_bg.toLowerCase().includes(linkSearch.toLowerCase()) ||
      ing.name_en.toLowerCase().includes(linkSearch.toLowerCase())
    )
    .slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-purple-600">🎂 KetoCakr Admin</h1>
              <div className="flex space-x-4">
                <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </button>
                <button className="text-purple-600 font-semibold">Ingredients</button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Ingredients Database</h2>
              <p className="text-gray-600 mt-1">Manage ingredients with nutritional information</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={downloadCSVTemplate} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                📥 Download Template
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                📤 Import CSV
              </button>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{ingredients.length}</div>
              <div className="text-sm text-gray-600">Total Ingredients</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ─── Left: Form ──────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingId ? 'Edit Ingredient' : 'Add New Ingredient'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name (BG) *</label>
                      <input
                        type="text"
                        value={formData.name_bg}
                        onChange={(e) => setFormData({ ...formData, name_bg: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Бадемово брашно"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN) *</label>
                      <input
                        type="text"
                        value={formData.name_en}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Almond flour"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name} / {cat.name_en}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={handleImageDrop}
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'} ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {uploading ? (
                        <div className="py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                        </div>
                      ) : formData.image_url ? (
                        <div className="space-y-2">
                          <img
                            src={formData.image_url}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg mx-auto"
                            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                          />
                          <p className="text-xs text-gray-500">Drag new image or click to replace</p>
                        </div>
                      ) : (
                        <div className="py-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">Drag & drop image here</p>
                          <p className="text-xs text-gray-500">or click to browse</p>
                        </div>
                      )}
                      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageInput} disabled={uploading} className="hidden" id="ingredient-image-upload" />
                      <label htmlFor="ingredient-image-upload" className="mt-2 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer text-sm">
                        {formData.image_url ? 'Change Image' : 'Select Image'}
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Or paste URL manually:</label>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Calories/100g</label>
                      <input type="number" step="0.1" value={formData.calories_per_100g} onChange={(e) => setFormData({ ...formData, calories_per_100g: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Protein/100g</label>
                      <input type="number" step="0.1" value={formData.protein_per_100g} onChange={(e) => setFormData({ ...formData, protein_per_100g: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fat/100g</label>
                      <input type="number" step="0.1" value={formData.fat_per_100g} onChange={(e) => setFormData({ ...formData, fat_per_100g: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Carbs/100g</label>
                      <input type="number" step="0.1" value={formData.carbs_per_100g} onChange={(e) => setFormData({ ...formData, carbs_per_100g: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fiber/100g</label>
                      <input type="number" step="0.1" value={formData.fiber_per_100g} onChange={(e) => setFormData({ ...formData, fiber_per_100g: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Unit</label>
                    <select value={formData.default_unit} onChange={(e) => setFormData({ ...formData, default_unit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="g">g (грама)</option>
                      <option value="ml">ml (милилитри)</option>
                      <option value="pcs">pcs (броя)</option>
                    </select>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">💰 Pricing</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Price</label>
                        <input type="number" step="0.01" min="0" value={formData.default_price} onChange={(e) => setFormData({ ...formData, default_price: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Currency</label>
                        <select value={formData.default_currency} onChange={(e) => setFormData({ ...formData, default_currency: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                          <option value="EUR">EUR (€)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Per</label>
                        <select value={formData.price_unit} onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                          <option value="kg">kg</option>
                          <option value="l">liter</option>
                          <option value="бр">piece</option>
                          <option value="pack">pack</option>
                        </select>
                      </div>
                    </div>
                    <div className="text-xs text-green-700 font-medium">
                      Preview: {formData.default_price || '0'} {formData.default_currency} / {formData.price_unit}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aliases (comma-separated)</label>
                    <input type="text" value={formData.aliases} onChange={(e) => setFormData({ ...formData, aliases: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="миндално брашно, almond meal" />
                    <p className="text-xs text-gray-500 mt-1">Alternative names for matching</p>
                  </div>

                  <div className="flex space-x-2">
                    <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* ─── Right: Tabs ──────────────────────────────────── */}
            <div className="lg:col-span-2">
              {/* Tab Switcher */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setRightTab('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${rightTab === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  📋 Списък ({ingredients.length})
                </button>
                <button
                  onClick={() => setRightTab('duplicates')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${rightTab === 'duplicates' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  🔍 Намери дубликати
                </button>
              </div>

              {/* ── LIST TAB ────────────────────────────────────── */}
              {rightTab === 'list' && (
                <>
                  <div className="bg-white rounded-lg shadow p-4 mb-4">
                    <input
                      type="search"
                      placeholder="Search ingredients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Съставка</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Рецепти</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Хранителни/100g</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredIngredients.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No ingredients found</td>
                            </tr>
                          ) : (
                            filteredIngredients.map((ing) => {
                              const count = usageCounts.get(ing.id) || 0;
                              const isExpanded = expandedId === ing.id;
                              return (
                                <>
                                  <tr key={ing.id} className={`hover:bg-gray-50 ${isExpanded ? 'bg-purple-50' : ''}`}>
                                    {/* Name */}
                                    <td className="px-4 py-3">
                                      <div className="flex items-center space-x-3">
                                        {ing.image_url ? (
                                          <img
                                            src={ing.image_url}
                                            alt={ing.name_bg}
                                            className="w-10 h-10 rounded object-cover"
                                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/40x40/e5e7eb/6b7280?text=' + encodeURIComponent(ing.name_en.charAt(0)); }}
                                          />
                                        ) : (
                                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-lg">🥚</div>
                                        )}
                                        <div>
                                          <div className="text-sm font-medium">{ing.name_bg}</div>
                                          <div className="text-xs text-gray-500">{ing.name_en}</div>
                                          {ing.ingredient_categories && (
                                            <span className="inline-block mt-0.5 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                                              {ing.ingredient_categories.name}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </td>

                                    {/* Recipe Count */}
                                    <td className="px-4 py-3">
                                      <button
                                        onClick={() => handleExpandIngredient(ing.id)}
                                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition ${count > 0 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                      >
                                        <span>{count} рецепти</span>
                                        <span>{isExpanded ? '▲' : '▼'}</span>
                                      </button>
                                    </td>

                                    {/* Nutrition */}
                                    <td className="px-4 py-3">
                                      <div className="text-xs space-y-0.5 text-gray-600">
                                        <div>🔥 {ing.calories_per_100g} kcal</div>
                                        <div>P:{ing.protein_per_100g}g F:{ing.fat_per_100g}g C:{ing.carbs_per_100g}g</div>
                                      </div>
                                    </td>

                                    {/* Price */}
                                    <td className="px-4 py-3">
                                      {(ing.default_price ?? 0) > 0 ? (
                                        <div className="text-xs">
                                          <div className="font-medium text-green-600">{ing.default_price} {ing.default_currency}</div>
                                          <div className="text-gray-500">/ {ing.price_unit}</div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-xs">—</span>
                                      )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3 text-right space-x-2">
                                      <button onClick={() => handleEdit(ing)} className="text-purple-600 hover:text-purple-900 text-sm font-medium">
                                        Edit
                                      </button>
                                      <button onClick={() => handleDelete(ing.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">
                                        Delete
                                      </button>
                                    </td>
                                  </tr>

                                  {/* ── Expanded Row ── */}
                                  {isExpanded && (
                                    <tr key={`${ing.id}-expanded`}>
                                      <td colSpan={5} className="px-4 py-4 bg-purple-50 border-b-2 border-purple-200">
                                        <div className="text-sm font-semibold text-purple-800 mb-3">
                                          📦 {ing.name_bg} / {ing.name_en} — използва се в рецепти:
                                        </div>

                                        {loadingUsages ? (
                                          <div className="flex items-center space-x-2 text-gray-500">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                            <span>Зареждане...</span>
                                          </div>
                                        ) : ingredientUsages.length === 0 ? (
                                          <div className="text-gray-500 text-sm">Не се използва в никоя рецепта.</div>
                                        ) : (
                                          <div className="space-y-2">
                                            {ingredientUsages.map((usage) => {
                                              const linkedIngredient = ingredients.find(i => i.id === usage.ingredient_database_id);
                                              const nameMatchesEn = linkedIngredient && usage.ingredient_name === linkedIngredient.name_en;
                                              const nameMatchesBg = linkedIngredient && usage.ingredient_name === linkedIngredient.name_bg;
                                              const nameMatches = nameMatchesEn || nameMatchesBg;

                                              return (
                                                <div key={usage.id} className="bg-white rounded-lg p-3 border border-purple-100">
                                                  <div className="flex items-start justify-between flex-wrap gap-2">
                                                    <div>
                                                      <div className="font-medium text-sm text-gray-800">
                                                        🍰 {usage.recipe?.name ?? '(рецепта не е намерена)'}
                                                        {usage.recipe?.role && (
                                                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                                                            {usage.recipe.role.name}
                                                          </span>
                                                        )}
                                                      </div>
                                                      <div className="text-xs text-gray-500 mt-0.5">
                                                        Количество: <span className="font-medium">{usage.quantity} {usage.unit}</span>
                                                        {' · '}
                                                        ingredient_name: <span className={`font-mono ${nameMatches ? 'text-green-600' : 'text-orange-600'}`}>"{usage.ingredient_name}"</span>
                                                        {' · '}
                                                        {usage.ingredient_database_id ? (
                                                          <span className="text-green-600">✓ свързано</span>
                                                        ) : (
                                                          <span className="text-red-500">✗ NULL</span>
                                                        )}
                                                      </div>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                      {/* Task 4: If NULL → show link button */}
                                                      {!usage.ingredient_database_id && (
                                                        <button
                                                          onClick={() => setLinkingUsageId(linkingUsageId === usage.id ? null : usage.id)}
                                                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                        >
                                                          🔗 Свържи
                                                        </button>
                                                      )}

                                                      {/* Task 4: If linked but name wrong → update name */}
                                                      {usage.ingredient_database_id && !nameMatches && (
                                                        <button
                                                          onClick={() => updateIngredientName(usage.id, usage.ingredient_database_id!)}
                                                          className="text-xs px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600"
                                                          title={`Ще обнови към: "${linkedIngredient?.name_en}"`}
                                                        >
                                                          ✏️ Обнови името
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* Link search dropdown */}
                                                  {linkingUsageId === usage.id && (
                                                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                      <p className="text-xs text-blue-700 font-medium mb-2">Избери съставка за свързване:</p>
                                                      <input
                                                        type="text"
                                                        value={linkSearch}
                                                        onChange={(e) => setLinkSearch(e.target.value)}
                                                        placeholder="Търси съставка..."
                                                        className="w-full px-3 py-1.5 border border-blue-300 rounded text-sm mb-2"
                                                        autoFocus
                                                      />
                                                      {filteredLinkIngredients.length === 0 ? (
                                                        <p className="text-xs text-gray-500">Няма резултати</p>
                                                      ) : (
                                                        <div className="space-y-1 max-h-40 overflow-y-auto">
                                                          {filteredLinkIngredients.map(option => (
                                                            <button
                                                              key={option.id}
                                                              onClick={() => linkRecipeIngredient(usage.id, option.id)}
                                                              className="w-full text-left px-3 py-1.5 text-sm bg-white border border-gray-200 rounded hover:bg-blue-100 hover:border-blue-400"
                                                            >
                                                              <span className="font-medium">{option.name_bg}</span>
                                                              <span className="text-gray-400"> / {option.name_en}</span>
                                                            </button>
                                                          ))}
                                                        </div>
                                                      )}
                                                      <button
                                                        onClick={() => { setLinkingUsageId(null); setLinkSearch(''); }}
                                                        className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                                                      >
                                                        Отказ
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                </>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Showing {filteredIngredients.length} of {ingredients.length} ingredients
                  </div>
                </>
              )}

              {/* ── DUPLICATES TAB ──────────────────────────────── */}
              {rightTab === 'duplicates' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-1">🔍 Намери дубликати</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Търси по частично име (BG или EN), избери правилната съставка и обедини дубликатите.
                  </p>

                  {/* Search */}
                  <div className="flex space-x-2 mb-6">
                    <input
                      type="text"
                      value={dupSearch}
                      onChange={(e) => setDupSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchDuplicates()}
                      placeholder="Напр. яйц, масло, брашн..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={searchDuplicates}
                      disabled={searchingDups || !dupSearch.trim()}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {searchingDups ? '⏳' : '🔍'} Търси
                    </button>
                  </div>

                  {/* Results */}
                  {dupResults.length > 0 && (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Намерени <strong>{dupResults.length}</strong> съставки. Избери коя да ЗАПАЗИШ (●) и кои да ИЗТРИЕШ (☑):
                      </p>

                      <div className="space-y-2 mb-4">
                        {dupResults.map((ing) => {
                          const isTarget = targetId === ing.id;
                          const isSource = sourceIds.has(ing.id);
                          return (
                            <div
                              key={ing.id}
                              className={`flex items-center space-x-3 p-3 border-2 rounded-lg transition ${isTarget ? 'border-green-400 bg-green-50' : isSource ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                              {/* Radio - KEEP */}
                              <label className="flex items-center space-x-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name="dup-target"
                                  checked={isTarget}
                                  onChange={() => selectTarget(ing.id)}
                                  className="accent-green-600"
                                />
                                <span className="text-xs font-medium text-green-700">ЗАПАЗИ</span>
                              </label>

                              {/* Checkbox - DELETE */}
                              <label className="flex items-center space-x-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSource}
                                  disabled={isTarget}
                                  onChange={() => toggleSource(ing.id)}
                                  className="accent-red-600"
                                />
                                <span className={`text-xs font-medium ${isTarget ? 'text-gray-300' : 'text-red-600'}`}>ИЗТРИЙ</span>
                              </label>

                              {/* Name */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{ing.name_bg}</div>
                                <div className="text-xs text-gray-500 truncate">{ing.name_en}</div>
                                <div className="text-xs text-gray-400 font-mono truncate">id: {ing.id.slice(0, 8)}...</div>
                              </div>

                              {/* Recipe count badge */}
                              <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-bold ${ing.recipeCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                {ing.recipeCount} рецепти
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Merge Preview + Button */}
                      {targetId && sourceIds.size > 0 && (
                        <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                          <p className="text-sm font-semibold text-orange-800 mb-1">⚠️ Преглед на обединяване:</p>
                          <p className="text-sm text-gray-700">
                            <span className="line-through text-red-600">
                              {Array.from(sourceIds).map(id => dupResults.find(r => r.id === id)?.name_bg).join('", "')}
                            </span>
                            {' → '}
                            <span className="font-bold text-green-700">
                              {dupResults.find(r => r.id === targetId)?.name_bg}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {Array.from(sourceIds).reduce((sum, id) => sum + (usageCounts.get(id) || 0), 0)} recipe_ingredients записа ще бъдат пренасочени
                          </p>
                          <button
                            onClick={handleMerge}
                            disabled={merging}
                            className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                          >
                            {merging ? '⏳ Обединяване...' : '🔄 Обедини избраните'}
                          </button>
                        </div>
                      )}

                      {targetId && sourceIds.size === 0 && (
                        <p className="text-sm text-gray-500 mt-2">↑ Маркирай поне един дубликат с ☑ ИЗТРИЙ</p>
                      )}

                      {!targetId && sourceIds.size > 0 && (
                        <p className="text-sm text-gray-500 mt-2">↑ Избери коя съставка да ЗАПАЗИШ с ● ЗАПАЗИ</p>
                      )}
                    </>
                  )}

                  {dupResults.length === 0 && dupSearch && !searchingDups && (
                    <p className="text-gray-500 text-sm">Няма намерени съставки за "{dupSearch}"</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Import CSV Data</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">CSV Content (preview)</label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                placeholder="Paste CSV data here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Required columns: name_bg, name_en, category_id, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g
              </p>
            </div>
            <div className="flex space-x-2">
              <button onClick={handleImportCSV} disabled={importing} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                {importing ? 'Importing...' : 'Import'}
              </button>
              <button onClick={() => { setShowImportModal(false); setImportText(''); }} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
