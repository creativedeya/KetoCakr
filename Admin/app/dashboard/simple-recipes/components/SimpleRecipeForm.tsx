'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';
import { IngredientAutocomplete } from '@/components/IngredientAutocomplete';
import { Wand2 } from 'lucide-react';
import AutoParseModal, { MatchedIngredient } from './AutoParseModal';
import GenerateStepImageButton from './GenerateStepImageButton';
import { EnhancedStepImages } from '../[id]/EnhancedStepImages';
import RecipeResourcesManager from '@/components/RecipeResourcesManager';

interface IngredientRow {
  ingredient_database_id: string | null;
  ingredient_name: string;
  quantity: number;
  unit: string;
  _calories?: number;
  _protein?: number;
  _fat?: number;
  _carbs?: number;
  _fiber?: number;
  _is_sugar_alcohol?: boolean;
  _piece_weight?: number | null;
}

interface StepRow {
  step_description_bg: string;
  step_description_en: string;
  step_duration_minutes: number;
  step_image_url: string;
}

interface EquipmentRow {
  item_bg: string;
  item: string;
  quantity: number;
  size: string;
  specs: string;
  essential: boolean;
  reusable: boolean;
  notes: string;
  equipment_id: number | null;
}

interface LabNoteRow {
  category: string;
  title_bg: string;
  title: string;
  content_bg: string;
  content: string;
  icon: string;
  is_active: boolean;
}

interface FormState {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  ingredients_text_bg: string;
  ingredients_text_en: string;
  instructions: string;
  image_url: string;
  servings: number;
  published_at: string | null;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  total_net_carbs: number;
  total_weight_grams: number;
}

interface Props {
  recipeId?: string;
  initialData?: any;
  initialIngredients?: any[];
  initialSteps?: any[];
  initialEquipment?: any[];
  initialLabNotes?: any[];
  onSaved: (id: string) => void;
  onCancel?: () => void;
}

type Tab = 'basic' | 'ingredients' | 'steps' | 'publish' | 'associations';

const UNITS = ['г', 'мл', 'бр', 'ч.л.', 'с.л.', 'чаша', 'кг', 'л'];
const LAB_NOTE_CATEGORIES = [
  { value: 'tip', label: 'Съвет' },
  { value: 'warning', label: 'Внимание' },
  { value: 'science', label: 'Наука' },
  { value: 'substitution', label: 'Заместители' },
  { value: 'storage', label: 'Съхранение' },
  { value: 'general', label: 'Общо' },
];

interface DessertType { id: number; name: string; name_en: string | null; }
interface ServingContainer { id: number; name: string; name_en: string | null; serving_container_type: string | null; }
interface CatalogEquipmentItem {
  id: number;
  name: string;
  name_en: string | null;
  icon: string | null;
  category: string | null;
  category_bg: string | null;
}

export default function SimpleRecipeForm({
  recipeId,
  initialData,
  initialIngredients,
  initialSteps,
  initialEquipment,
  initialLabNotes,
  onSaved,
  onCancel,
}: Props) {
  const [tab, setTab] = useState<Tab>('basic');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [currentRecipeId, setCurrentRecipeId] = useState<string | undefined>(recipeId);
  const [tab1Errors, setTab1Errors] = useState<string | null>(null);
  const [tab4Errors, setTab4Errors] = useState<string | null>(null);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [showAutoParseModal, setShowAutoParseModal] = useState(false);
  const [ingredientsMode, setIngredientsMode] = useState<'manual' | 'bulk'>('manual');
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [editIngredientSearch, setEditIngredientSearch] = useState('');
  const [bulkIngText, setBulkIngText] = useState('');
  const [bulkIngParsing, setBulkIngParsing] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  // Tab 5 state
  const [tab5Loaded, setTab5Loaded] = useState(false);
  const [savedIngredients, setSavedIngredients] = useState<any[]>([]);
  const [savedEquipment, setSavedEquipment] = useState<any[]>([]);
  const [savedSteps, setSavedSteps] = useState<any[]>([]);
  const [stepIngAssoc, setStepIngAssoc] = useState<Record<string, number[]>>({});
  const [stepEqAssoc, setStepEqAssoc] = useState<Record<string, number[]>>({});
  const [savingAssoc, setSavingAssoc] = useState(false);

  // Tab 4 catalog equipment picker
  const [catalogEquipment, setCatalogEquipment] = useState<CatalogEquipmentItem[]>([]);
  const [eqSearch, setEqSearch] = useState('');
  const [expandedEqCats, setExpandedEqCats] = useState<Set<string>>(new Set());

  const [form, setForm] = useState<FormState>({
    name: initialData?.name || '',
    name_en: initialData?.name_en || '',
    description: initialData?.description || '',
    description_en: initialData?.description_en || '',
    ingredients_text_bg: initialData?.ingredients_text_bg || '',
    ingredients_text_en: initialData?.ingredients_text_en || '',
    instructions: initialData?.instructions || '',
    image_url: initialData?.image_url || '',
    servings: initialData?.servings || 1,
    published_at: initialData?.published_at || null,
    total_calories: initialData?.total_calories || 0,
    total_protein: initialData?.total_protein || 0,
    total_fat: initialData?.total_fat || 0,
    total_carbs: initialData?.total_carbs || 0,
    total_net_carbs: initialData?.total_net_carbs || 0,
    total_weight_grams: initialData?.total_weight_grams || 0,
  });

  // ready_recipes-only fields — Tab 4 dropdowns
  const [dessertTypeId, setDessertTypeId] = useState<string>(
    initialData?.ready_dessert_type_id ? String(initialData.ready_dessert_type_id) : ''
  );
  const [servingContainerId, setServingContainerId] = useState<number | null>(
    initialData?.ready_serving_container_id || null
  );
  const [difficultyLevel, setDifficultyLevel] = useState<number>(
    initialData?.ready_difficulty_level ?? 2
  );

  const [dessertTypes, setDessertTypes] = useState<DessertType[]>([]);
  const [servingContainers, setServingContainers] = useState<ServingContainer[]>([]);

  useEffect(() => {
    supabase.from('dessert_types').select('id, name, name_en').order('name')
      .then(({ data }) => { if (data) setDessertTypes(data); });
    supabase.from('equipment')
      .select('id, name, name_en, serving_container_type')
      .eq('is_serving_container', true)
      .order('name')
      .then(({ data }) => { if (data) setServingContainers(data); });
    supabase.from('equipment')
      .select('id, name, name_en, icon, category, category_bg')
      .order('category').order('name')
      .then(({ data }) => {
        if (!data) return;
        setCatalogEquipment(data);
        // Auto-expand first 2 categories
        const cats = [...new Set(data.map((e: any) => e.category).filter(Boolean))] as string[];
        setExpandedEqCats(new Set(cats.slice(0, 2)));
      });
  }, []);

  // Load Tab 5 data when tab switches to 'associations' and not yet loaded
  useEffect(() => {
    if (tab === 'associations' && !tab5Loaded && currentRecipeId) {
      loadTab5Data(currentRecipeId);
    }
  }, [tab, tab5Loaded, currentRecipeId]);

  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    (initialIngredients || []).map((ing: any) => ({
      ingredient_database_id: ing.ingredient_database_id || null,
      ingredient_name: ing.ingredient_name || '',
      quantity: Number(ing.quantity) || 0,
      unit: ing.unit || 'г',
      _calories: ing.ingredients_database?.calories_per_100g,
      _protein: ing.ingredients_database?.protein_per_100g,
      _fat: ing.ingredients_database?.fat_per_100g,
      _carbs: ing.ingredients_database?.carbs_per_100g,
      _fiber: ing.ingredients_database?.fiber_per_100g,
      _is_sugar_alcohol: ing.ingredients_database?.is_sugar_alcohol || false,
    }))
  );

  const [steps, setSteps] = useState<StepRow[]>(
    (initialSteps || []).map((s: any) => ({
      step_description_bg: s.step_description_bg || s.step_description || '',
      step_description_en: s.step_description_en || '',
      step_duration_minutes: Number(s.step_duration_minutes) || 0,
      step_image_url: s.step_image_url || '',
    }))
  );

  const [equipment, setEquipment] = useState<EquipmentRow[]>(
    (initialEquipment || []).map((eq: any) => ({
      item_bg: eq.item_bg || '',
      item: eq.item || '',
      quantity: eq.quantity || 1,
      size: eq.size || '',
      specs: eq.specs || '',
      essential: eq.essential ?? true,
      reusable: eq.reusable ?? true,
      notes: eq.notes || '',
      equipment_id: eq.equipment_id || null,
    }))
  );

  const [labNotes, setLabNotes] = useState<LabNoteRow[]>(
    (initialLabNotes || []).map((ln: any) => ({
      category: ln.category || 'general',
      title_bg: ln.title_bg || '',
      title: ln.title || '',
      content_bg: ln.content_bg || '',
      content: ln.content || '',
      icon: ln.icon || '🧪',
      is_active: ln.is_active ?? true,
    }))
  );

  // Auto-calculate nutrition from ingredients
  useEffect(() => {
    const UNIT_TO_GRAMS: Record<string, number> = {
      'g': 1, 'г': 1, 'ml': 1, 'мл': 1,
      'tsp': 5, 'ч.л.': 5,
      'tbsp': 15, 'с.л.': 15,
      'cup': 240, 'чаша': 240,
      'kg': 1000, 'кг': 1000,
      'l': 1000, 'л': 1000,
    };
    const PIECE_UNITS = new Set(['бр', 'бр.', 'piece', 'pkg', 'бройк']);
    let cal = 0, prot = 0, fat = 0, carbs = 0, fiber = 0, wt = 0;
    ingredients.forEach(ing => {
      const q = Number(ing.quantity) || 0;
      if (q > 0) {
        let multiplier: number;
        let countForWeight = false;
        if (UNIT_TO_GRAMS[ing.unit] !== undefined) {
          multiplier = UNIT_TO_GRAMS[ing.unit];
          countForWeight = true;
        } else if (PIECE_UNITS.has(ing.unit) && ing._piece_weight) {
          multiplier = ing._piece_weight;
          countForWeight = true;
        } else {
          multiplier = 1;
          countForWeight = false;
        }
        const qg = q * multiplier;
        if (countForWeight) wt += qg;
        cal  += (ing._calories || 0) * qg / 100;
        prot += (ing._protein  || 0) * qg / 100;
        fat  += (ing._fat      || 0) * qg / 100;
        if (!ing._is_sugar_alcohol) {
          carbs += (ing._carbs || 0) * qg / 100;
          fiber += (ing._fiber || 0) * qg / 100;
        }
      }
    });
    const net = Math.max(0, carbs - fiber);
    setForm(prev => ({
      ...prev,
      total_calories: Math.round(cal * 10) / 10,
      total_protein: Math.round(prot * 10) / 10,
      total_fat: Math.round(fat * 10) / 10,
      total_carbs: Math.round(carbs * 10) / 10,
      total_net_carbs: Math.round(net * 10) / 10,
      total_weight_grams: Math.round(wt),
    }));
  }, [ingredients]);

  const parseBulkIngredients = async () => {
    if (!bulkIngText.trim()) return;
    setBulkIngParsing(true);
    try {
      const res = await fetch('/api/simple-recipes/parse-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bulkIngText }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setIngredients(data.ingredients.map((ing: any) => ({
        ingredient_database_id: ing.ingredient_database_id || null,
        ingredient_name: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit,
        _calories: ing._calories,
        _protein: ing._protein,
        _fat: ing._fat,
        _carbs: ing._carbs,
        _fiber: ing._fiber,
        _is_sugar_alcohol: ing._is_sugar_alcohol || false,
        _piece_weight: ing._piece_weight || null,
      })));
      setBulkIngText('');
      setIngredientsMode('manual');
    } catch (err: any) {
      setMsg({ type: 'error', text: `Parse error: ${err.message}` });
    } finally {
      setBulkIngParsing(false);
    }
  };

  const addIngredient = async (ingredient: { id: string; name_bg: string; name_en: string }) => {
    const { data } = await supabase
      .from('ingredients_database')
      .select('calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, is_sugar_alcohol, default_piece_weight_grams')
      .eq('id', ingredient.id)
      .single();

    const defaultUnit = data?.default_piece_weight_grams ? 'бр' : 'г';

    setIngredients(prev => [...prev, {
      ingredient_database_id: ingredient.id,
      ingredient_name: ingredient.name_bg,
      quantity: data?.default_piece_weight_grams ? 1 : 100,
      unit: defaultUnit,
      _calories: data?.calories_per_100g,
      _protein: data?.protein_per_100g,
      _fat: data?.fat_per_100g,
      _carbs: data?.carbs_per_100g,
      _fiber: data?.fiber_per_100g,
      _is_sugar_alcohol: data?.is_sugar_alcohol || false,
      _piece_weight: data?.default_piece_weight_grams || null,
    }]);
    setIngredientSearch('');
  };

  const updateIngredient = (i: number, field: keyof IngredientRow, value: any) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  };

  const updateStep = (i: number, field: keyof StepRow, value: any) => {
    setSteps(prev => {
      const s = [...prev];
      s[i] = { ...s[i], [field]: value };
      return s;
    });
  };

  const toggleStep = (i: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const [stepsMode, setStepsMode] = useState<'manual' | 'bulk'>('manual');
  const [bulkText, setBulkText] = useState('');
  const [bulkParsing, setBulkParsing] = useState(false);

  const parseBulkSteps = async () => {
    if (!bulkText.trim()) return;
    setBulkParsing(true);
    try {
      const res = await fetch('/api/simple-recipes/parse-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bulkText, recipeName: form.name || form.name_en }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const parsed = data.steps.map((s: any) => ({
        step_description_bg: s.step_description_bg || '',
        step_description_en: s.step_description_en || '',
        step_duration_minutes: s.step_duration_minutes || 0,
        step_image_url: '',
      }));
      setSteps(parsed);
      // Expand first step after bulk parse
      setExpandedSteps(new Set([0]));
      setBulkText('');
      setStepsMode('manual');
    } catch (err: any) {
      setMsg({ type: 'error', text: `Parse error: ${err.message}` });
    } finally {
      setBulkParsing(false);
    }
  };

  const moveStep = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    setSteps(prev => {
      const s = [...prev];
      [s[i], s[j]] = [s[j], s[i]];
      return s;
    });
    // Keep the same step (now at new position) expanded
    setExpandedSteps(prev => {
      const next = new Set<number>();
      prev.forEach(idx => {
        if (idx === i) next.add(j);
        else if (idx === j) next.add(i);
        else next.add(idx);
      });
      return next;
    });
  };

  const updateEquipment = (i: number, field: keyof EquipmentRow, value: any) => {
    setEquipment(prev => {
      const n = [...prev];
      n[i] = { ...n[i], [field]: value };
      return n;
    });
  };

  const updateLabNote = (i: number, field: keyof LabNoteRow, value: any) => {
    setLabNotes(prev => {
      const n = [...prev];
      n[i] = { ...n[i], [field]: value };
      return n;
    });
  };

  const catalogByCategory = useMemo(() => {
    const q = eqSearch.trim().toLowerCase();
    const filtered = q
      ? catalogEquipment.filter(e =>
          e.name.toLowerCase().includes(q) || (e.name_en && e.name_en.toLowerCase().includes(q)))
      : catalogEquipment;
    return Object.entries(
      filtered.reduce((acc, eq) => {
        const cat = eq.category || 'Друго';
        if (!acc[cat]) acc[cat] = { label: eq.category_bg || cat, items: [] as CatalogEquipmentItem[] };
        acc[cat].items.push(eq);
        return acc;
      }, {} as Record<string, { label: string; items: CatalogEquipmentItem[] }>)
    ).sort(([a], [b]) => a.localeCompare(b));
  }, [catalogEquipment, eqSearch]);

  const toggleCatalogItem = (item: CatalogEquipmentItem) => {
    const isSelected = equipment.some(e => e.equipment_id === item.id);
    if (isSelected) {
      setEquipment(prev => prev.filter(e => e.equipment_id !== item.id));
    } else {
      setEquipment(prev => [...prev, {
        item_bg: item.name,
        item: item.name_en || '',
        quantity: 1,
        size: '',
        specs: '',
        essential: true,
        reusable: true,
        notes: '',
        equipment_id: item.id,
      }]);
    }
  };

  const loadTab5Data = async (id: string) => {
    try {
      const res = await fetch(`/api/simple-recipes/${id}`);
      const json = await res.json();
      if (!json.success) return;
      setSavedIngredients(json.ingredients || []);
      setSavedEquipment(json.equipment || []);
      setSavedSteps(json.steps || []);
      // Initialize associations from existing saved values
      const ingAssoc: Record<string, number[]> = {};
      const eqAssoc: Record<string, number[]> = {};
      for (const step of (json.steps || [])) {
        // ingredients_used is TEXT[] in the DB — values come back as strings; cast to number
        // so that .includes(ing.id) works (ing.id is a number from recipe_ingredients PK)
        ingAssoc[step.id] = (step.ingredients_used || []).map(Number);
        eqAssoc[step.id] = step.equipment_needed || [];
      }
      setStepIngAssoc(ingAssoc);
      setStepEqAssoc(eqAssoc);
      setTab5Loaded(true);
    } catch (err) {
      console.error('[Tab5] Failed to load associations data:', err);
    }
  };

  // Tab 1 validation — no API call; all state stays client-side until Tab 4
  const handleTab1Next = () => {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push('Името (BG) е задължително');
    if (!form.name_en.trim()) errs.push('Name (EN) е задължително');
    if ((form.servings || 0) < 1) errs.push('Порциите трябва да са поне 1');
    if (errs.length > 0) { setTab1Errors(errs.join(' · ')); return; }
    setTab1Errors(null);
    setTab('ingredients');
  };

  const save = async (publish?: boolean) => {
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Името (BG) е задължително' }); return; }
    if (tab === 'publish' || publish) {
      const t4errs: string[] = [];
      if (!dessertTypeId) t4errs.push('Тип десерт е задължителен');
      if (!servingContainerId) t4errs.push('Посуда за сервиране е задължителна');
      if (t4errs.length > 0) { setTab4Errors(t4errs.join(' · ')); return; }
    }
    setTab4Errors(null);
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        ...form,
        is_simple_recipe: true,
        published_at: publish ? new Date().toISOString() : form.published_at,
        dessert_type_id: dessertTypeId || null,
        serving_container_id: servingContainerId,
        difficulty_level: difficultyLevel,
        ingredients: ingredients.map((ing, i) => ({
          ingredient_database_id: ing.ingredient_database_id,
          ingredient_name: ing.ingredient_name,
          quantity: ing.quantity,
          unit: ing.unit,
          order_index: i,
        })),
        steps: steps.map((s, i) => ({
          step_number: i + 1,
          step_description_bg: s.step_description_bg,
          step_description_en: s.step_description_en,
          step_duration_minutes: s.step_duration_minutes,
          step_image_url: s.step_image_url || null,
        })),
        equipment: equipment.map(eq => ({
          item_bg: eq.item_bg,
          item: eq.item || null,
          quantity: eq.quantity || 1,
          size: eq.size || null,
          specs: eq.specs || null,
          essential: eq.essential,
          reusable: eq.reusable,
          notes: eq.notes || null,
          equipment_id: eq.equipment_id || null,
        })),
        lab_notes: labNotes.map(ln => ({
          category: ln.category,
          title_bg: ln.title_bg,
          title: ln.title || null,
          content_bg: ln.content_bg || '',
          content: ln.content || '',
          icon: ln.icon || '🧪',
          is_active: ln.is_active,
        })),
      };

      const id = currentRecipeId;
      const url = id ? `/api/simple-recipes/${id}` : '/api/simple-recipes';
      const method = id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const savedId = data.data.id;
      setCurrentRecipeId(savedId);
      if (publish) setForm(prev => ({ ...prev, published_at: data.data.published_at }));
      setMsg({ type: 'success', text: publish ? '✅ Публикувано!' : '✅ Записано!' });

      // After Tab 4 save: advance to Tab 5 for step associations
      // Reset tab5Loaded so fresh data is fetched
      setTab5Loaded(false);
      if (tab === 'publish') {
        await loadTab5Data(savedId);
        setTab('associations');
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const unpublish = async () => {
    if (!currentRecipeId) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/simple-recipes/${currentRecipeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published_at: null }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setForm(prev => ({ ...prev, published_at: null }));
      setMsg({ type: 'success', text: 'Скрито от потребителите.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const saveAndFinish = async () => {
    if (!currentRecipeId) return;
    setSavingAssoc(true);
    setMsg(null);
    try {
      const stepAssociations = savedSteps.map(step => ({
        stepId: step.id,
        ingredientIds: stepIngAssoc[step.id] || [],
        equipmentIds: stepEqAssoc[step.id] || [],
      }));
      const res = await fetch(`/api/simple-recipes/${currentRecipeId}/step-associations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepAssociations }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onSaved(currentRecipeId);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
      setSavingAssoc(false);
    }
  };

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500';
  const lbl = 'block text-sm font-medium text-gray-700 mb-1';
  const tabBtn = (t: Tab) =>
    tab === t
      ? 'px-4 py-2 bg-rose-600 text-white rounded-t-lg text-sm font-medium'
      : 'px-4 py-2 bg-gray-100 text-gray-600 rounded-t-lg text-sm font-medium hover:bg-gray-200 transition';

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-6 border-b border-gray-200 flex-wrap">
        <button type="button" className={tabBtn('basic')} onClick={() => setTab('basic')}>📝 Basic Info</button>
        <button type="button" className={tabBtn('ingredients')} onClick={() => setTab('ingredients')}>
          🥚 Ingredients ({ingredients.length})
        </button>
        <button type="button" className={tabBtn('steps')} onClick={() => setTab('steps')}>
          📋 Steps ({steps.length})
        </button>
        <button type="button" className={tabBtn('publish')} onClick={() => setTab('publish')}>🚀 Publishing</button>
        {currentRecipeId && (
          <button type="button" className={tabBtn('associations')} onClick={() => setTab('associations')}>
            🔗 Асоциации
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Messages */}
        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {msg.text}
          </div>
        )}

        {/* ─── BASIC INFO ─── */}
        {tab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Име (BG) *</label>
                <input className={inp} value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Шоколадов кекс в чаша" />
              </div>
              <div>
                <label className={lbl}>Name (EN)</label>
                <input className={inp} value={form.name_en}
                  onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))}
                  placeholder="Chocolate mug cake" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Описание (BG)</label>
                <textarea className={inp} rows={3} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className={lbl}>Description (EN)</label>
                <textarea className={inp} rows={3} value={form.description_en}
                  onChange={e => setForm(p => ({ ...p, description_en: e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAutoParseModal(true)}
                disabled={!form.description_en?.trim() && !form.description?.trim()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-rose-300 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Wand2 size={15} />
                Auto-Parse with AI
              </button>
              <span className="text-xs text-gray-400">Extracts ingredients &amp; steps from the description above</span>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Текстово съдържание (от PDF импорт)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Съставки (BG)</label>
                  <textarea className={inp} rows={6} value={form.ingredients_text_bg}
                    onChange={e => setForm(p => ({ ...p, ingredients_text_bg: e.target.value }))}
                    placeholder={'- Съставка 1\n- Съставка 2'} />
                </div>
                <div>
                  <label className={lbl}>Ingredients (EN)</label>
                  <textarea className={inp} rows={6} value={form.ingredients_text_en}
                    onChange={e => setForm(p => ({ ...p, ingredients_text_en: e.target.value }))}
                    placeholder={'- Ingredient 1\n- Ingredient 2'} />
                </div>
              </div>
              <div>
                <label className={lbl}>Инструкции (BG)</label>
                <textarea className={inp} rows={8} value={form.instructions}
                  onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                  placeholder={'1. Стъпка 1\n2. Стъпка 2'} />
              </div>
            </div>

            <div className="max-w-xs">
              <label className={lbl}>Servings (порции)</label>
              <input className={inp} type="number" min={1} value={form.servings}
                onChange={e => setForm(p => ({ ...p, servings: parseInt(e.target.value) || 1 }))} />
            </div>

            <div>
              <label className={lbl}>Hero Image</label>
              <ImageUpload
                value={form.image_url}
                onChange={url => setForm(p => ({ ...p, image_url: url }))}
                recipeId={currentRecipeId}
                bucket="recipe-images"
                pathPrefix="simple-recipes"
              />
            </div>
          </div>
        )}

        {/* ─── INGREDIENTS ─── */}
        {tab === 'ingredients' && (
          <div className="space-y-4">
            {/* Nutrition summary */}
            <div className="grid grid-cols-5 gap-3 p-4 bg-rose-50 rounded-lg text-center">
              {[
                { val: form.total_calories, label: 'Cal' },
                { val: `${form.total_protein}g`, label: 'Protein' },
                { val: `${form.total_fat}g`, label: 'Fat' },
                { val: `${form.total_carbs}g`, label: 'Carbs' },
                { val: `${form.total_net_carbs}g`, label: 'Net Carbs' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div className="text-lg font-bold text-rose-600">{val}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            {form.servings > 1 && form.total_calories > 0 && (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                <strong>Per serving ({form.servings}x):</strong>{' '}
                {Math.round(form.total_calories / form.servings)} cal ·{' '}
                {(form.total_net_carbs / form.servings).toFixed(1)}g NC ·{' '}
                {(form.total_protein / form.servings).toFixed(1)}g prot
              </div>
            )}

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setIngredientsMode('manual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${ingredientsMode === 'manual' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                ✍️ Ръчно въвеждане
              </button>
              <button type="button" onClick={() => setIngredientsMode('bulk')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${ingredientsMode === 'bulk' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                📋 Bulk Parse
              </button>
              {ingredients.length > 0 && (
                <span className="text-xs text-gray-400 ml-2">{ingredients.length} съставки</span>
              )}
            </div>

            {ingredientsMode === 'bulk' && (
              <div className="border-2 border-dashed border-rose-300 rounded-xl p-4 space-y-3 bg-rose-50">
                <p className="text-sm text-rose-700 font-medium">📋 Постави текст — AI ще раздели и свърже с базата</p>
                <textarea className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  rows={8} value={bulkIngText} onChange={e => setBulkIngText(e.target.value)}
                  placeholder={"- 3 яйца\n- 100г бадемово брашно\n- 70г еритритол"} />
                <div className="flex items-center gap-3">
                  <button type="button" onClick={parseBulkIngredients} disabled={bulkIngParsing || !bulkIngText.trim()}
                    className="px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition">
                    {bulkIngParsing ? '⏳ Parsing...' : '✨ Parse Съставки'}
                  </button>
                  <button type="button" onClick={() => { setBulkIngText(''); setIngredientsMode('manual'); }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition">
                    Откажи
                  </button>
                </div>
              </div>
            )}

            {ingredientsMode === 'manual' && (
              <>
                <div>
                  <label className={lbl}>Add Ingredient</label>
                  <IngredientAutocomplete value={ingredientSearch} onChange={setIngredientSearch}
                    onSelect={addIngredient} placeholder="Търси съставка..." />
                </div>

                {ingredients.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">Няма добавени съставки.</p>
                ) : (
                  <div className="space-y-2">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        {editingIngredientIndex === i ? (
                          <div className="flex-1">
                            <IngredientAutocomplete value={editIngredientSearch} onChange={setEditIngredientSearch}
                              onSelect={async (selected) => {
                                const { data } = await supabase
                                  .from('ingredients_database')
                                  .select('calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, is_sugar_alcohol, default_piece_weight_grams')
                                  .eq('id', selected.id).single();
                                setIngredients(prev => {
                                  const updated = [...prev];
                                  updated[i] = {
                                    ...updated[i],
                                    ingredient_database_id: selected.id,
                                    ingredient_name: selected.name_bg,
                                    _calories: data?.calories_per_100g,
                                    _protein: data?.protein_per_100g,
                                    _fat: data?.fat_per_100g,
                                    _carbs: data?.carbs_per_100g,
                                    _fiber: data?.fiber_per_100g,
                                    _is_sugar_alcohol: data?.is_sugar_alcohol || false,
                                    _piece_weight: data?.default_piece_weight_grams || null,
                                  };
                                  return updated;
                                });
                                setEditingIngredientIndex(null);
                                setEditIngredientSearch('');
                              }}
                              placeholder={ing.ingredient_name} autoFocus />
                            <button type="button" onClick={() => { setEditingIngredientIndex(null); setEditIngredientSearch(''); }}
                              className="text-xs text-gray-400 hover:text-gray-600 mt-1">Откажи</button>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <span className={`text-sm font-medium truncate ${ing.ingredient_database_id ? 'text-gray-700' : 'text-amber-600'}`}>
                              {ing.ingredient_name}
                            </span>
                            {!ing.ingredient_database_id ? (
                              <button type="button"
                                onClick={() => { setEditingIngredientIndex(i); setEditIngredientSearch(ing.ingredient_name); }}
                                className="shrink-0 text-xs text-amber-600 hover:text-amber-800 border border-amber-300 hover:border-amber-500 rounded px-2 py-0.5 transition whitespace-nowrap">
                                ⚠️ Свържи
                              </button>
                            ) : (
                              <button type="button"
                                onClick={() => { setEditingIngredientIndex(i); setEditIngredientSearch(ing.ingredient_name); }}
                                className="shrink-0 text-xs text-gray-400 hover:text-gray-600 transition">✏️</button>
                            )}
                          </div>
                        )}
                        <input type="number" min={0} step={0.1} value={ing.quantity}
                          onChange={e => updateIngredient(i, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" />
                        <select value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm">
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <span className="text-xs text-gray-400 w-20 text-right shrink-0">
                          {ing.unit === 'бр' && ing._piece_weight
                            ? `= ${Math.round(ing.quantity * ing._piece_weight)}г`
                            : ing.unit === 'бр' && !ing._piece_weight
                            ? <span className="text-amber-400">няма тегло</span>
                            : ing._calories && (ing.unit === 'г' || ing.unit === 'g')
                            ? `${Math.round(ing._calories * ing.quantity / 100)} cal`
                            : ''
                          }
                        </span>
                        <button type="button"
                          onClick={() => {
                            setIngredients(prev => prev.filter((_, j) => j !== i));
                            if (editingIngredientIndex === i) setEditingIngredientIndex(null);
                          }}
                          className="text-red-400 hover:text-red-600 px-1 text-lg leading-none shrink-0">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── STEPS ─── */}
        {tab === 'steps' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setStepsMode('manual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${stepsMode === 'manual' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                ✍️ Стъпка по стъпка
              </button>
              <button type="button" onClick={() => setStepsMode('bulk')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${stepsMode === 'bulk' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                📋 Bulk Parse
              </button>
              {steps.length > 0 && (
                <span className="text-xs text-gray-400 ml-2">{steps.length} стъпки</span>
              )}
              {steps.length > 1 && stepsMode === 'manual' && (
                <button type="button"
                  onClick={() => setExpandedSteps(expandedSteps.size === steps.length ? new Set() : new Set(steps.map((_, i) => i)))}
                  className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition">
                  {expandedSteps.size === steps.length ? 'Скрий всички' : 'Покажи всички'}
                </button>
              )}
            </div>

            {stepsMode === 'bulk' && (
              <div className="border-2 border-dashed border-rose-300 rounded-xl p-4 space-y-3 bg-rose-50">
                <p className="text-sm text-rose-700 font-medium">📋 Въведи целия текст — AI ще го раздели на стъпки</p>
                <textarea className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  rows={10} value={bulkText} onChange={e => setBulkText(e.target.value)}
                  placeholder={"1. Загрей фурната до 180°C.\n2. Смесете брашното с бакпулвера."} />
                <div className="flex items-center gap-3">
                  <button type="button" onClick={parseBulkSteps} disabled={bulkParsing || !bulkText.trim()}
                    className="px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition">
                    {bulkParsing ? '⏳ Parsing...' : '✨ Parse Steps'}
                  </button>
                  <button type="button" onClick={() => { setBulkText(''); setStepsMode('manual'); }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition">
                    Откажи
                  </button>
                </div>
              </div>
            )}

            {stepsMode === 'manual' && steps.map((step, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Collapsed header — always visible */}
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition"
                  onClick={() => toggleStep(i)}
                >
                  <span className="text-xs font-bold text-gray-400 w-6 shrink-0">#{i + 1}</span>
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {step.step_description_bg || step.step_description_en || <span className="text-gray-400 italic">Без описание</span>}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {step.step_image_url && <span className="text-xs text-green-500">📷</span>}
                    <button type="button" onClick={e => { e.stopPropagation(); moveStep(i, -1); }} disabled={i === 0}
                      className="px-1.5 py-0.5 text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30">▲</button>
                    <button type="button" onClick={e => { e.stopPropagation(); moveStep(i, 1); }} disabled={i === steps.length - 1}
                      className="px-1.5 py-0.5 text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30">▼</button>
                    <button type="button" onClick={e => { e.stopPropagation(); setSteps(prev => prev.filter((_, j) => j !== i)); setExpandedSteps(prev => { const n = new Set<number>(); prev.forEach(idx => { if (idx !== i) n.add(idx > i ? idx - 1 : idx); }); return n; }); }}
                      className="px-1.5 py-0.5 text-xs text-red-400 hover:text-red-600">✕</button>
                    <span className="text-gray-400 text-xs ml-1">{expandedSteps.has(i) ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Expanded content */}
                {expandedSteps.has(i) && (
                  <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Описание (BG)</label>
                        <textarea className={inp} rows={3} value={step.step_description_bg}
                          onChange={e => updateStep(i, 'step_description_bg', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description (EN)</label>
                        <textarea className={inp} rows={3} value={step.step_description_en}
                          onChange={e => updateStep(i, 'step_description_en', e.target.value)} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min)</label>
                        <input type="number" min={0} value={step.step_duration_minutes}
                          onChange={e => updateStep(i, 'step_duration_minutes', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Step Image URL</label>
                        <input type="url" value={step.step_image_url}
                          onChange={e => updateStep(i, 'step_image_url', e.target.value)}
                          className={inp} placeholder="https://..." />
                      </div>
                    </div>
                    {/* Image slot — always same height to prevent scroll-jump on generate */}
                    <div className="mt-3 flex items-center gap-3 min-h-[48px]">
                      <GenerateStepImageButton
                        recipe_id={currentRecipeId}
                        step_number={i + 1}
                        step_description={step.step_description_en || step.step_description_bg}
                        recipe_name={form.name_en || form.name}
                        onImageGenerated={(url) => updateStep(i, 'step_image_url', url)}
                      />
                      {step.step_image_url ? (
                        <>
                          <img src={step.step_image_url} alt={`Стъпка ${i + 1}`}
                            className="h-12 w-12 object-cover rounded border border-gray-200" />
                          <button type="button" onClick={() => updateStep(i, 'step_image_url', '')}
                            className="text-xs text-red-400 hover:text-red-600 transition">Remove image</button>
                        </>
                      ) : (
                        <div className="h-12 w-12 rounded border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                          <span className="text-xs text-gray-300">📷</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {stepsMode === 'manual' && (
              <button type="button"
                onClick={() => {
                  const newIndex = steps.length;
                  setSteps(prev => [...prev, { step_description_bg: '', step_description_en: '', step_duration_minutes: 0, step_image_url: '' }]);
                  setExpandedSteps(prev => new Set([...prev, newIndex]));
                }}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-rose-400 hover:text-rose-500 transition">
                + Добави стъпка
              </button>
            )}
          </div>
        )}

        {/* ─── PUBLISHING ─── */}
        {tab === 'publish' && (
          <div className="space-y-4">
            {/* Status indicator */}
            <div className={`p-4 rounded-lg border ${form.published_at ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${form.published_at ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="font-medium text-gray-700">
                  {form.published_at ? '🟢 Публикувано' : '⚫ Чернова'}
                </span>
              </div>
              {form.published_at && (
                <p className="text-xs text-gray-500">{new Date(form.published_at).toLocaleString('bg-BG')}</p>
              )}
            </div>

            {/* Mobile fields */}
            <div className="border border-green-200 rounded-xl p-4 bg-green-50 space-y-3">
              <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">📱 Информация за мобилното приложение</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={lbl}>Тип десерт <span className="text-red-500">*</span></label>
                  <select value={dessertTypeId} onChange={e => setDessertTypeId(e.target.value)} className={inp}>
                    <option value="">— Избери тип —</option>
                    {dessertTypes.map(type => (
                      <option key={type.id} value={String(type.id)}>{type.name || type.name_en}</option>
                    ))}
                  </select>
                  {dessertTypes.length === 0 && <p className="text-xs text-amber-600 mt-1">⚠️ Няма типове в dessert_types</p>}
                </div>
                <div>
                  <label className={lbl}>Посуда за сервиране</label>
                  <select value={servingContainerId ?? ''} onChange={e => setServingContainerId(e.target.value ? parseInt(e.target.value) : null)} className={inp}>
                    <option value="">— Без посуда —</option>
                    {servingContainers.map(sc => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}{sc.name_en ? ` / ${sc.name_en}` : ''}{sc.serving_container_type ? ` [${sc.serving_container_type}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Ниво на трудност</label>
                  <select value={difficultyLevel} onChange={e => setDifficultyLevel(parseInt(e.target.value))} className={inp}>
                    <option value="1">1 — Много лесно</option>
                    <option value="2">2 — Лесно</option>
                    <option value="3">3 — Средно</option>
                    <option value="4">4 — Трудно</option>
                    <option value="5">5 — Много трудно</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Equipment Section — catalog checkbox picker */}
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">🔧 Посуда / Уреди</p>
                <span className="text-xs text-blue-600 font-medium">
                  {equipment.filter(e => e.equipment_id !== null).length} от каталога
                  {equipment.filter(e => e.equipment_id === null).length > 0 && ` · ${equipment.filter(e => e.equipment_id === null).length} custom`}
                </span>
              </div>

              {/* Search */}
              <input type="text" placeholder="Търси уред... (блендер, купа, форма...)"
                value={eqSearch} onChange={e => setEqSearch(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />

              {/* Catalog grouped checkboxes */}
              <div className="space-y-1 max-h-72 overflow-y-auto border border-blue-200 rounded-lg p-2 bg-white">
                {catalogEquipment.length === 0 ? (
                  <p className="text-xs text-gray-400 p-3 text-center">Зарежда каталог...</p>
                ) : catalogByCategory.length === 0 ? (
                  <p className="text-xs text-gray-400 p-3 text-center">Няма резултати</p>
                ) : catalogByCategory.map(([cat, { label, items }]) => {
                  const catSelected = items.filter(i => equipment.some(e => e.equipment_id === i.id)).length;
                  const isExpanded = expandedEqCats.has(cat);
                  return (
                    <div key={cat} className="border border-gray-100 rounded-lg overflow-hidden mb-1">
                      <button type="button"
                        onClick={() => setExpandedEqCats(prev => {
                          const n = new Set(prev);
                          n.has(cat) ? n.delete(cat) : n.add(cat);
                          return n;
                        })}
                        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-blue-50 text-left transition text-xs">
                        <span className="font-semibold text-gray-700">{label} <span className="text-gray-400 font-normal">({items.length})</span></span>
                        <div className="flex items-center gap-2">
                          {catSelected > 0 && (
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">{catSelected}</span>
                          )}
                          <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-2 py-1.5 space-y-0.5">
                          {items.map(item => {
                            const selIdx = equipment.findIndex(e => e.equipment_id === item.id);
                            const isChecked = selIdx >= 0;
                            return (
                              <div key={item.id} className={`rounded-lg px-2 py-1 ${isChecked ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'}`}>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={isChecked}
                                    onChange={() => toggleCatalogItem(item)}
                                    className="rounded text-blue-600" />
                                  {item.icon && <span className="text-sm leading-none">{item.icon}</span>}
                                  <span className="text-sm text-gray-800 flex-1">{item.name}</span>
                                </label>
                                {isChecked && (
                                  <div className="mt-1 ml-6 flex items-center gap-2">
                                    <label className="text-xs text-gray-500 shrink-0">бр:</label>
                                    <input type="number" min={1} value={equipment[selIdx].quantity}
                                      onChange={e => updateEquipment(selIdx, 'quantity', parseInt(e.target.value) || 1)}
                                      className="w-14 px-2 py-0.5 border border-blue-200 rounded text-xs" />
                                    <input type="text" value={equipment[selIdx].notes}
                                      onChange={e => updateEquipment(selIdx, 'notes', e.target.value)}
                                      className="flex-1 px-2 py-0.5 border border-blue-200 rounded text-xs"
                                      placeholder="напр. 20см, силиконова..." />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Custom items (not in catalog) */}
              <div className="border-t border-blue-200 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-blue-700 font-medium">Custom уреди (без каталог)</p>
                  <button type="button"
                    onClick={() => setEquipment(prev => [...prev, { item_bg: '', item: '', quantity: 1, size: '', specs: '', essential: true, reusable: true, notes: '', equipment_id: null }])}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    + Добави custom
                  </button>
                </div>
                {equipment.filter(e => e.equipment_id === null).map((eq, _) => {
                  const i = equipment.indexOf(eq);
                  return (
                    <div key={i} className="bg-white rounded-lg p-2 border border-blue-200 flex items-center gap-2">
                      <input className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" value={eq.item_bg}
                        onChange={e => updateEquipment(i, 'item_bg', e.target.value)} placeholder="Наименование (BG) *" />
                      <input type="number" min={1} value={eq.quantity}
                        onChange={e => updateEquipment(i, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-14 px-2 py-1 border border-gray-300 rounded text-xs" />
                      <button type="button" onClick={() => setEquipment(prev => prev.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 text-sm px-1 leading-none">✕</button>
                    </div>
                  );
                })}
                {equipment.filter(e => e.equipment_id === null).length === 0 && (
                  <p className="text-xs text-gray-400">Няма custom уреди</p>
                )}
              </div>
            </div>

            {/* Lab Notes Section */}
            <div className="border border-amber-200 rounded-xl p-4 bg-amber-50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">🧪 Лабораторни Бележки</p>
                <button type="button"
                  onClick={() => setLabNotes(prev => [...prev, { category: 'tip', title_bg: '', title: '', content_bg: '', content: '', icon: '🧪', is_active: true }])}
                  className="text-xs px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                  + Добави бележка
                </button>
              </div>
              {labNotes.length === 0 ? (
                <p className="text-sm text-amber-600">Няма добавени бележки.</p>
              ) : (
                <div className="space-y-3">
                  {labNotes.map((ln, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Бележка {i + 1}</span>
                        <button type="button" onClick={() => setLabNotes(prev => prev.filter((_, j) => j !== i))}
                          className="text-xs text-red-400 hover:text-red-600 transition">✕ Изтрий</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Категория</label>
                          <select className={inp} value={ln.category}
                            onChange={e => updateLabNote(i, 'category', e.target.value)}>
                            {LAB_NOTE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Икона</label>
                          <input className={inp} value={ln.icon}
                            onChange={e => updateLabNote(i, 'icon', e.target.value)}
                            placeholder="🧪" maxLength={4} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Заглавие (BG)</label>
                          <input className={inp} value={ln.title_bg}
                            onChange={e => updateLabNote(i, 'title_bg', e.target.value)}
                            placeholder="Съвет за..." />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Title (EN)</label>
                          <input className={inp} value={ln.title}
                            onChange={e => updateLabNote(i, 'title', e.target.value)}
                            placeholder="Tip for..." />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Съдържание (BG)</label>
                          <textarea className={inp} rows={3} value={ln.content_bg}
                            onChange={e => updateLabNote(i, 'content_bg', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Content (EN)</label>
                          <textarea className={inp} rows={3} value={ln.content}
                            onChange={e => updateLabNote(i, 'content', e.target.value)} />
                        </div>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={ln.is_active}
                          onChange={e => updateLabNote(i, 'is_active', e.target.checked)} className="rounded" />
                        Активна бележка
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resources — video links, source URLs, etc. */}
            {currentRecipeId && (
              <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">📎 Ресурси (Видео / Линкове)</p>
                <RecipeResourcesManager recipeId={currentRecipeId} recipeType="simple" />
              </div>
            )}

            {/* Nutrition summary */}
            {form.total_calories > 0 && (
              <div className="p-4 bg-white border rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3 text-sm">Nutrition Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Calories: <strong>{form.total_calories}</strong></div>
                  <div>Protein: <strong>{form.total_protein}g</strong></div>
                  <div>Fat: <strong>{form.total_fat}g</strong></div>
                  <div>Net Carbs: <strong>{form.total_net_carbs}g</strong></div>
                  <div>Total Weight: <strong>{form.total_weight_grams}g</strong></div>
                  <div>Servings: <strong>{form.servings}</strong></div>
                </div>
                {form.servings > 1 && (
                  <div className="mt-2 pt-2 border-t text-sm text-gray-500">
                    Per serving: <strong>{Math.round(form.total_calories / form.servings)} cal</strong> ·{' '}
                    <strong>{(form.total_net_carbs / form.servings).toFixed(1)}g NC</strong>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-400 space-y-1">
              <p>• Запазено → рецептата се вижда само в admin панела</p>
              <p>• Публикувано → показва се на всички потребители</p>
              <p>• След запазване ще можеш да зададеш кои съставки и уреди се използват в всяка стъпка (Таб 5)</p>
            </div>
          </div>
        )}

        {/* ─── TAB 5: STEP ASSOCIATIONS ─── */}
        {tab === 'associations' && (
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
              Отбележи кои съставки и уреди се използват в всяка стъпка.
              Тази информация се показва в мобилното приложение по стъпки.
            </div>

            {!tab5Loaded ? (
              <div className="text-center py-12 text-gray-400">Зареждане на данни...</div>
            ) : savedSteps.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Няма запазени стъпки. Запази рецептата в Таб 4 първо.</div>
            ) : (
              <div className="space-y-3">
                {savedSteps.map((step) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3 text-sm">
                      Стъпка {step.step_number}
                      {step.step_description_bg && (
                        <span className="ml-2 text-gray-400 font-normal">
                          — {step.step_description_bg.slice(0, 60)}{step.step_description_bg.length > 60 ? '…' : ''}
                        </span>
                      )}
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      {/* Ingredients */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">🥚 Съставки</p>
                        {savedIngredients.length === 0 ? (
                          <p className="text-xs text-gray-400">Няма запазени съставки</p>
                        ) : (
                          <div className="space-y-1.5">
                            {savedIngredients.map((ing: any) => (
                              <label key={ing.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
                                <input type="checkbox"
                                  checked={(stepIngAssoc[step.id] || []).includes(ing.id)}
                                  onChange={e => {
                                    const prev = stepIngAssoc[step.id] || [];
                                    const next = e.target.checked
                                      ? [...prev, ing.id]
                                      : prev.filter((id: number) => id !== ing.id);
                                    setStepIngAssoc(p => ({ ...p, [step.id]: next }));
                                  }}
                                  className="rounded" />
                                <span className="text-gray-700">{ing.ingredient_name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Equipment */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">🔧 Уреди</p>
                        {savedEquipment.length === 0 ? (
                          <p className="text-xs text-gray-400">Няма запазена посуда/уреди</p>
                        ) : (
                          <div className="space-y-1.5">
                            {savedEquipment.map((eq: any) => (
                              <label key={eq.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
                                <input type="checkbox"
                                  checked={(stepEqAssoc[step.id] || []).includes(eq.id)}
                                  onChange={e => {
                                    const prev = stepEqAssoc[step.id] || [];
                                    const next = e.target.checked
                                      ? [...prev, eq.id]
                                      : prev.filter((id: number) => id !== eq.id);
                                    setStepEqAssoc(p => ({ ...p, [step.id]: next }));
                                  }}
                                  className="rounded" />
                                <span className="text-gray-700">{eq.item_bg || eq.item}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step Images — inside Tab 5, after associations */}
            {tab5Loaded && currentRecipeId && savedSteps.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mt-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">🖼️ Изображения на Стъпките</h3>
                <EnhancedStepImages
                  recipeId={currentRecipeId}
                  steps={savedSteps}
                  onStepsUpdate={() => loadTab5Data(currentRecipeId)}
                  recipeName={form.name_en || form.name}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auto-Parse Modal */}
      <AutoParseModal
        isOpen={showAutoParseModal}
        onClose={() => setShowAutoParseModal(false)}
        description={form.description_en || form.description || ''}
        onIngredientsFound={(matched: MatchedIngredient[]) => {
          setIngredients(matched.map(ing => ({
            ingredient_database_id: ing.ingredient_database_id || null,
            ingredient_name: ing.name_bg || ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            _calories: ing.nutrition?.calories_per_100g,
            _protein: ing.nutrition?.protein_per_100g,
            _fat: ing.nutrition?.fat_per_100g,
            _carbs: ing.nutrition?.carbs_per_100g,
            _fiber: ing.nutrition?.fiber_per_100g,
          })));
        }}
        onStepsFound={(parsed) => {
          setSteps(parsed.map(s => ({
            step_description_bg: s.step_description_bg || s.step_description,
            step_description_en: s.step_description_en || s.step_description,
            step_duration_minutes: s.step_duration_minutes || 5,
            step_image_url: '',
          })));
        }}
      />

      {/* Action buttons — tab-aware wizard navigation */}
      <div className="px-6 pb-6 pt-2 border-t border-gray-100">
        {tab1Errors && tab === 'basic' && (
          <p className="text-sm text-red-600 mb-3">⚠️ {tab1Errors}</p>
        )}
        {tab4Errors && tab === 'publish' && (
          <p className="text-sm text-red-600 mb-3">⚠️ {tab4Errors}</p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          {tab === 'basic' && (
            <>
              {onCancel && (
                <button type="button" onClick={onCancel}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition">
                  ← Назад
                </button>
              )}
              <button type="button" onClick={handleTab1Next}
                className="px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition">
                → Следваш
              </button>
            </>
          )}
          {(tab === 'ingredients' || tab === 'steps') && (
            <>
              <button type="button"
                onClick={() => setTab(tab === 'ingredients' ? 'basic' : 'ingredients')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                ← Назад
              </button>
              <button type="button"
                onClick={() => setTab(tab === 'ingredients' ? 'steps' : 'publish')}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition">
                {tab === 'ingredients' ? '→ Стъпки' : '→ Финализиране'}
              </button>
            </>
          )}
          {tab === 'publish' && (
            <>
              <button type="button" onClick={() => setTab('steps')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                ← Стъпки
              </button>
              <button type="button" onClick={() => save(false)}
                disabled={saving || !form.name.trim()}
                className="px-5 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition">
                {saving ? 'Записване...' : '💾 Запази чернова'}
              </button>
              {!form.published_at ? (
                <button type="button" onClick={() => save(true)}
                  disabled={saving}
                  className="px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition">
                  {saving ? 'Публикуване...' : '🚀 Публикувай'}
                </button>
              ) : (
                <>
                  <button type="button" onClick={unpublish} disabled={saving}
                    className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition">
                    Скрий
                  </button>
                  <button type="button" onClick={() => save(false)} disabled={saving || !form.name.trim()}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                    {saving ? 'Записване...' : '💾 Запази промените'}
                  </button>
                </>
              )}
            </>
          )}
          {tab === 'associations' && (
            <>
              <button type="button" onClick={() => setTab('publish')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                ← Публикуване
              </button>
              <button type="button" onClick={saveAndFinish}
                disabled={savingAssoc || !currentRecipeId || !tab5Loaded}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition">
                {savingAssoc ? 'Запазване...' : '✅ Запази и Завърши'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
