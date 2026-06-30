'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/lib/supabase';

interface TarotCard {
  id: string;
  card_number: number;
  suit: string | null;
  arcana_type: 'major' | 'minor';
  card_name: string;
  card_name_en: string | null;
  theme: string | null;
  theme_en: string | null;
  recipe_role_id: number | null;
  linked_recipe_id: string | null;
  linked_base_recipe_id: string | null;
  daily_phrase: string;
  daily_phrase_en: string | null;
  energy_word: string;
  energy_word_en: string | null;
  morning_tip: string;
  morning_tip_en: string | null;
  daily_trap: string;
  daily_trap_en: string | null;
  evening_question: string;
  evening_question_en: string | null;
  card_image_url: string | null;
  image_source_mode: string;
  is_published: boolean;
}

interface BaseRecipeItem {
  id: string;
  name: string;
  name_en: string | null;
  image_url: string | null;
}

const SUIT_TO_ROLE_ID: Record<string, number> = {
  pentacles: 1, swords: 2, wands: 3, cups: 4,
};
const SUIT_ROLE_LABEL: Record<string, string> = {
  pentacles: 'Блат', swords: 'Крем', wands: 'Плънка', cups: 'Декор',
};

interface ReadyRecipe {
  id: string;
  name_bg: string;
  name_en: string | null;
  hero_image_url: string | null;
}

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

const MINOR_LABELS: Record<number, string> = {
  1: 'Асо', 11: 'Паж', 12: 'Рицар', 13: 'Кралица', 14: 'Крал',
};

function previewCardNumber(arcanaType: string, n: number): string {
  if (arcanaType === 'major') return ROMAN[n] ?? String(n);
  return MINOR_LABELS[n] ?? String(n);
}

const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500';
const lbl = 'block text-sm font-medium text-gray-700 mb-1';
const textarea = `${inp} resize-y`;

export default function TarotCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params.id as string;
  const isNew = cardId === 'new';

  const [card, setCard] = useState<Partial<TarotCard>>({
    arcana_type: 'major',
    card_number: 0,
    suit: null,
    is_published: false,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [readyRecipes, setReadyRecipes] = useState<ReadyRecipe[]>([]);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [roleBaseRecipes, setRoleBaseRecipes] = useState<BaseRecipeItem[]>([]);
  const [baseRecipeSearch, setBaseRecipeSearch] = useState('');
  const [imageSourceMode, setImageSourceMode] = useState<'recipe' | 'custom'>('recipe');

  useEffect(() => {
    supabase
      .from('ready_recipes')
      .select('id, name_bg, name_en, hero_image_url')
      .neq('status', 'archived')
      .order('name_bg')
      .then(({ data }) => { if (data) setReadyRecipes(data); });
  }, []);

  useEffect(() => {
    if (card.arcana_type !== 'minor' || !card.suit) {
      setRoleBaseRecipes([]);
      return;
    }
    const roleId = SUIT_TO_ROLE_ID[card.suit];
    if (!roleId) return;
    supabase
      .from('base_recipes')
      .select('id, name, name_en, image_url')
      .eq('recipe_role_id', roleId)
      .eq('is_visible_to_users', true)
      .order('name')
      .then(({ data }) => { if (data) setRoleBaseRecipes(data); });
  }, [card.suit, card.arcana_type]);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`/api/tarot-cards/${cardId}`)
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          setCard(json.data);
          setImageSourceMode((json.data.image_source_mode as 'recipe' | 'custom') || 'recipe');
        } else alert('Картата не е намерена');
      })
      .catch(err => alert('Грешка: ' + err.message))
      .finally(() => setLoading(false));
  }, [cardId, isNew]);

  useEffect(() => {
    if (imageSourceMode !== 'recipe' || card.arcana_type !== 'minor' || !card.linked_base_recipe_id) return;
    const linked = roleBaseRecipes.find(r => r.id === card.linked_base_recipe_id);
    if (linked?.image_url) setCard(p => ({ ...p, card_image_url: linked.image_url }));
  }, [card.linked_base_recipe_id, imageSourceMode, roleBaseRecipes]);

  async function save(andPublish = false) {
    if (!card.card_name?.trim()) { alert('⚠️ Името (BG) е задължително'); return; }
    if (!card.daily_phrase?.trim()) { alert('⚠️ Дневната фраза е задължителна'); return; }
    if (!card.energy_word?.trim()) { alert('⚠️ Думата на деня е задължителна'); return; }
    if (!card.morning_tip?.trim()) { alert('⚠️ Сутрешният съвет е задължителен'); return; }
    if (!card.daily_trap?.trim()) { alert('⚠️ Капанът на деня е задължителен'); return; }
    if (!card.evening_question?.trim()) { alert('⚠️ Вечерният въпрос е задължителен'); return; }

    setSaving(true);
    try {
      const payload = {
        ...card,
        is_published: andPublish ? true : card.is_published,
        suit: card.arcana_type === 'major' ? null : (card.suit || null),
        recipe_role_id: card.arcana_type === 'minor' ? (card.recipe_role_id || null) : null,
        linked_recipe_id: card.arcana_type === 'major' ? (card.linked_recipe_id || null) : null,
        linked_base_recipe_id: card.arcana_type === 'minor' ? (card.linked_base_recipe_id || null) : null,
        image_source_mode: imageSourceMode,
      };

      let res: Response;
      if (isNew) {
        res = await fetch('/api/tarot-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/tarot-cards/${cardId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      if (isNew) {
        router.push(`/dashboard/tarot-cards/${json.data.id}`);
      } else {
        setCard(json.data);
        alert(andPublish ? '✅ Картата е публикувана!' : '✅ Запазено!');
      }
    } catch (err: any) {
      alert('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredRecipes = readyRecipes.filter(r =>
    !recipeSearch ||
    r.name_bg.toLowerCase().includes(recipeSearch.toLowerCase()) ||
    (r.name_en || '').toLowerCase().includes(recipeSearch.toLowerCase())
  );

  if (loading) return <div className="p-6 text-gray-400">Зареждане...</div>;

  const cardNumPreview = previewCardNumber(card.arcana_type || 'major', card.card_number ?? 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div>
        <Link href="/dashboard/tarot-cards" className="text-sm text-gray-400 hover:text-gray-600 mb-3 inline-block">
          ← Tarot Cards
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isNew ? '+ Нова Карта' : (card.card_name || 'Редактирай Карта')}
        </h1>
        {!isNew && card.arcana_type && (
          <p className="text-gray-500 mt-1">
            {card.arcana_type === 'major' ? `Major Arcana · ${cardNumPreview}` : `Minor Arcana · ${card.suit || ''} · ${cardNumPreview}`}
          </p>
        )}
      </div>

      {/* BASIC INFO */}
      <section className="border border-gray-200 rounded-lg p-5 bg-white space-y-4">
        <h2 className="text-base font-semibold text-gray-900">🃏 Основна Информация</h2>

        {/* Arcana type */}
        <div>
          <span className={lbl}>Тип Аркана</span>
          <div className="flex gap-4 mt-1">
            {(['major', 'minor'] as const).map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="arcana_type"
                  value={type}
                  checked={card.arcana_type === type}
                  onChange={() => {
                    setImageSourceMode('recipe');
                    setCard(p => {
                      const newSuit = type === 'major' ? null : (p.suit || 'pentacles');
                      return {
                        ...p,
                        arcana_type: type,
                        suit: newSuit,
                        card_image_url: null,
                        image_source_mode: 'recipe',
                        recipe_role_id: type === 'minor' ? (SUIT_TO_ROLE_ID[newSuit || 'pentacles'] ?? null) : null,
                        linked_base_recipe_id: null,
                      };
                    });
                  }}
                  className="accent-rose-600"
                />
                <span className="text-sm font-medium">{type === 'major' ? 'Major Arcana' : 'Minor Arcana'}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Suit (Minor only) */}
        {card.arcana_type === 'minor' && (
          <div>
            <label className={lbl}>Масть</label>
            <select
              value={card.suit || ''}
              onChange={e => {
                const s = e.target.value;
                setBaseRecipeSearch('');
                setCard(p => ({
                  ...p,
                  suit: s,
                  recipe_role_id: SUIT_TO_ROLE_ID[s] ?? null,
                  linked_base_recipe_id: null,
                  card_image_url: imageSourceMode === 'recipe' ? null : p.card_image_url,
                }));
              }}
              className={inp}
            >
              <option value="">— Избери масть —</option>
              <option value="pentacles">Пентакли</option>
              <option value="cups">Чаши</option>
              <option value="swords">Мечове</option>
              <option value="wands">Жезли</option>
            </select>
          </div>
        )}

        {/* Card number */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>
              Номер на картата
              {card.arcana_type === 'major' ? ' (0–21)' : ' (1–14: Асо=1, Паж=11, Рицар=12, Кралица=13, Крал=14)'}
            </label>
            <input
              type="number"
              min={0}
              max={card.arcana_type === 'major' ? 21 : 14}
              value={card.card_number ?? 0}
              onChange={e => setCard(p => ({ ...p, card_number: parseInt(e.target.value) || 0 }))}
              className={inp}
            />
          </div>
          <div className="flex items-end pb-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center w-full">
              <div className="text-xs text-gray-400 mb-1">Изглед на номера</div>
              <div className="text-xl font-bold text-gray-800">{cardNumPreview}</div>
            </div>
          </div>
        </div>

        {/* Names */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Име (BG) *</label>
            <input
              className={inp}
              value={card.card_name || ''}
              onChange={e => setCard(p => ({ ...p, card_name: e.target.value }))}
              placeholder="Луната"
            />
          </div>
          <div>
            <label className={lbl}>Name (EN)</label>
            <input
              className={inp}
              value={card.card_name_en || ''}
              onChange={e => setCard(p => ({ ...p, card_name_en: e.target.value }))}
              placeholder="The Moon"
            />
          </div>
        </div>

        {/* Theme */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Тема / Подзаглавие (BG)</label>
            <input
              className={inp}
              value={card.theme || ''}
              onChange={e => setCard(p => ({ ...p, theme: e.target.value }))}
              placeholder="Кремообразни блатове"
            />
          </div>
          <div>
            <label className={lbl}>Theme (EN)</label>
            <input
              className={inp}
              value={card.theme_en || ''}
              onChange={e => setCard(p => ({ ...p, theme_en: e.target.value }))}
              placeholder="Creamy sponge layers"
            />
          </div>
        </div>

        {/* Image — toggle between auto-recipe source and custom upload */}
        <div>
          <span className={lbl}>Снимка на картата</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-3">
            {(['recipe', 'custom'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setImageSourceMode(mode);
                  if (mode === 'recipe') {
                    if (card.arcana_type === 'major' && card.linked_recipe_id) {
                      const r = readyRecipes.find(r => r.id === card.linked_recipe_id);
                      setCard(p => ({ ...p, image_source_mode: mode, card_image_url: r?.hero_image_url ?? p.card_image_url }));
                    } else if (card.arcana_type === 'minor' && card.linked_base_recipe_id) {
                      const r = roleBaseRecipes.find(r => r.id === card.linked_base_recipe_id);
                      setCard(p => ({ ...p, image_source_mode: mode, card_image_url: r?.image_url ?? p.card_image_url }));
                    } else {
                      setCard(p => ({ ...p, image_source_mode: mode }));
                    }
                  } else {
                    setCard(p => ({ ...p, image_source_mode: mode }));
                  }
                }}
                className={`flex-1 px-3 py-2 text-sm font-medium transition ${imageSourceMode === mode ? 'bg-rose-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {mode === 'recipe' ? 'От рецептата' : 'Друга снимка'}
              </button>
            ))}
          </div>
          {imageSourceMode === 'recipe' ? (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              {card.card_image_url ? (
                <div className="flex flex-col items-start gap-2">
                  <img src={card.card_image_url} alt="Снимка" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                  <span className="text-xs text-gray-500">Снимката идва от свързаната рецепта</span>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">
                  {card.arcana_type === 'major'
                    ? 'Избери готова рецепта по-долу — снимката ще се добави автоматично.'
                    : 'Избери компонент по-долу — снимката ще се добави автоматично.'}
                </p>
              )}
            </div>
          ) : (
            <ImageUpload
              value={card.card_image_url || ''}
              onChange={async (url) => {
                setCard(p => ({ ...p, card_image_url: url }));
                if (!isNew) {
                  await fetch(`/api/tarot-cards/${cardId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ card_image_url: url }),
                  });
                }
              }}
              recipeId={isNew ? undefined : cardId}
              bucket="tarot-images"
              pathPrefix="tarot-cards"
            />
          )}
        </div>
      </section>

      {/* RECIPE LINKAGE */}
      <section className="border border-gray-200 rounded-lg p-5 bg-white space-y-4">
        <h2 className="text-base font-semibold text-gray-900">🔗 Свързване с Рецепта</h2>

        {card.arcana_type === 'major' ? (
          <div className="space-y-3">
            <label className={lbl}>Готова рецепта (торта — Major Arcana)</label>
            <input
              type="text"
              placeholder="Търси готова рецепта..."
              value={recipeSearch}
              onChange={e => setRecipeSearch(e.target.value)}
              className={inp}
            />
            {recipeSearch && (
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {filteredRecipes.length === 0 ? (
                  <div className="p-3 text-sm text-gray-400 text-center">Няма резултати</div>
                ) : filteredRecipes.slice(0, 20).map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setCard(p => ({ ...p, linked_recipe_id: r.id, card_image_url: imageSourceMode === 'recipe' ? (r.hero_image_url || null) : p.card_image_url }));
                      setRecipeSearch('');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left border-b last:border-b-0"
                  >
                    {r.hero_image_url && (
                      <img src={r.hero_image_url} alt={r.name_bg} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-medium">{r.name_bg}</div>
                      {r.name_en && <div className="text-xs text-gray-400">{r.name_en}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {card.linked_recipe_id && (() => {
              const linked = readyRecipes.find(r => r.id === card.linked_recipe_id);
              return (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-800 font-medium">
                      ✅ {linked?.name_bg || card.linked_recipe_id}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCard(p => ({ ...p, linked_recipe_id: null, card_image_url: imageSourceMode === 'recipe' ? null : p.card_image_url }))}
                      className="ml-auto text-xs text-red-500 hover:text-red-700"
                    >
                      Премахни
                    </button>
                  </div>
                  {card.card_image_url && (
                    <div className="flex flex-col items-start gap-1">
                      <img
                        src={card.card_image_url}
                        alt="Снимка на картата"
                        className="w-24 h-24 object-cover rounded-lg border border-green-200"
                      />
                      <span className="text-xs text-gray-500">Снимката идва от готовата рецепта</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Auto-derived role from suit — read-only */}
            {card.suit && (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                Тип компонент: <strong>{SUIT_ROLE_LABEL[card.suit] ?? card.suit}</strong>
                <span className="text-gray-400 ml-1">(определено от масть)</span>
              </div>
            )}

            {/* Specific base recipe picker */}
            <label className={lbl}>Конкретна рецепта (Minor Arcana)</label>
            <input
              type="text"
              placeholder={card.suit ? `Търси ${SUIT_ROLE_LABEL[card.suit] ?? 'компонент'}...` : 'Избери масть първо'}
              value={baseRecipeSearch}
              onChange={e => setBaseRecipeSearch(e.target.value)}
              disabled={!card.suit}
              className={inp}
            />
            {baseRecipeSearch && (
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {roleBaseRecipes.filter(r =>
                  r.name.toLowerCase().includes(baseRecipeSearch.toLowerCase()) ||
                  (r.name_en || '').toLowerCase().includes(baseRecipeSearch.toLowerCase())
                ).slice(0, 20).map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setCard(p => ({ ...p, linked_base_recipe_id: r.id, card_image_url: imageSourceMode === 'recipe' ? (r.image_url || p.card_image_url) : p.card_image_url }));
                      setBaseRecipeSearch('');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left border-b last:border-b-0"
                  >
                    {r.image_url && (
                      <img src={r.image_url} alt={r.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-medium">{r.name}</div>
                      {r.name_en && <div className="text-xs text-gray-400">{r.name_en}</div>}
                    </div>
                  </button>
                ))}
                {roleBaseRecipes.filter(r =>
                  r.name.toLowerCase().includes(baseRecipeSearch.toLowerCase()) ||
                  (r.name_en || '').toLowerCase().includes(baseRecipeSearch.toLowerCase())
                ).length === 0 && (
                  <div className="p-3 text-sm text-gray-400 text-center">Няма резултати</div>
                )}
              </div>
            )}
            {card.linked_base_recipe_id && (() => {
              const linked = roleBaseRecipes.find(r => r.id === card.linked_base_recipe_id);
              return (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  {linked?.image_url && (
                    <img src={linked.image_url} alt={linked.name} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-blue-800 font-medium">
                      ✅ {linked?.name || card.linked_base_recipe_id}
                    </span>
                    {linked?.name_en && <div className="text-xs text-blue-500">{linked.name_en}</div>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCard(p => ({ ...p, linked_base_recipe_id: null, card_image_url: imageSourceMode === 'recipe' ? null : p.card_image_url }))}
                    className="text-xs text-red-500 hover:text-red-700 flex-shrink-0"
                  >
                    Премахни
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </section>

      {/* RITUAL CONTENT */}
      <section className="border border-gray-200 rounded-lg p-5 bg-white space-y-4">
        <h2 className="text-base font-semibold text-gray-900">✨ Ритуално Съдържание</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Дума на деня (BG) *</label>
            <input className={inp} value={card.energy_word || ''}
              onChange={e => setCard(p => ({ ...p, energy_word: e.target.value }))}
              placeholder="Смелост" />
          </div>
          <div>
            <label className={lbl}>Energy Word (EN)</label>
            <input className={inp} value={card.energy_word_en || ''}
              onChange={e => setCard(p => ({ ...p, energy_word_en: e.target.value }))}
              placeholder="Courage" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Дневна фраза (BG) *</label>
            <textarea className={textarea} rows={3} value={card.daily_phrase || ''}
              onChange={e => setCard(p => ({ ...p, daily_phrase: e.target.value }))}
              placeholder="Фразата за деня..." />
          </div>
          <div>
            <label className={lbl}>Daily Phrase (EN)</label>
            <textarea className={textarea} rows={3} value={card.daily_phrase_en || ''}
              onChange={e => setCard(p => ({ ...p, daily_phrase_en: e.target.value }))}
              placeholder="The phrase for today..." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Сутрешен съвет (BG) *</label>
            <textarea className={textarea} rows={3} value={card.morning_tip || ''}
              onChange={e => setCard(p => ({ ...p, morning_tip: e.target.value }))}
              placeholder="Съветът за сутринта..." />
          </div>
          <div>
            <label className={lbl}>Morning Tip (EN)</label>
            <textarea className={textarea} rows={3} value={card.morning_tip_en || ''}
              onChange={e => setCard(p => ({ ...p, morning_tip_en: e.target.value }))}
              placeholder="The morning tip..." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Капанът на деня (BG) *</label>
            <textarea className={textarea} rows={3} value={card.daily_trap || ''}
              onChange={e => setCard(p => ({ ...p, daily_trap: e.target.value }))}
              placeholder="Капанът, от който да внимаваш..." />
          </div>
          <div>
            <label className={lbl}>Daily Trap (EN)</label>
            <textarea className={textarea} rows={3} value={card.daily_trap_en || ''}
              onChange={e => setCard(p => ({ ...p, daily_trap_en: e.target.value }))}
              placeholder="The trap to watch out for..." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Вечерен въпрос (BG) *</label>
            <textarea className={textarea} rows={3} value={card.evening_question || ''}
              onChange={e => setCard(p => ({ ...p, evening_question: e.target.value }))}
              placeholder="Въпросът за вечерта..." />
          </div>
          <div>
            <label className={lbl}>Evening Question (EN)</label>
            <textarea className={textarea} rows={3} value={card.evening_question_en || ''}
              onChange={e => setCard(p => ({ ...p, evening_question_en: e.target.value }))}
              placeholder="The question for the evening..." />
          </div>
        </div>
      </section>

      {/* PUBLISHING */}
      <section className="border border-green-200 rounded-lg p-5 bg-green-50 space-y-4">
        <h2 className="text-base font-semibold text-green-900">📱 Публикуване</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={card.is_published || false}
            onChange={e => setCard(p => ({ ...p, is_published: e.target.checked }))}
            className="w-4 h-4 accent-green-600"
          />
          <span className="text-sm font-medium text-green-900">Публикувана (видима в мобилното приложение)</span>
        </label>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition"
          >
            {saving ? '⟳ Запазване...' : '💾 Запази'}
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving || card.is_published}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition"
          >
            {card.is_published ? '✅ Вече публикувана' : '📱 Запази и Публикувай'}
          </button>
        </div>
      </section>
    </div>
  );
}
