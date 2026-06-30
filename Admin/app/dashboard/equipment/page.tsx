'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/ImageUpload'

interface EquipmentItem {
  id: number
  slug: string
  name: string
  name_en: string
  icon: string
  category: string
  image_url: string | null
  reference_image_url: string | null
  variations: any
  ai_prompt_keywords: string[]
  is_serving_container: boolean
  serving_container_type: string | null
  created_at: string
}

const defaultFormState = {
  name: '',
  name_en: '',
  slug: '',
  category: '',
  icon: '',
  image_url: '',
  reference_image_url: '',
  variations: '',
  ai_prompt_keywords: '',
  is_serving_container: false,
  serving_container_type: '' as string | null,
}

const categoryOptions = [
  'Appliance',
  'Bakeware',
  'Cookware',
  'Utensil',
  'Accessory',
  'Other',
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function EquipmentManagerPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState(defaultFormState)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadEquipment()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function loadEquipment() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setEquipment(data || [])
    } catch (error) {
      console.error('Error loading equipment:', error)
      setErrorMessage('Failed to load equipment items')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData(defaultFormState)
    setEditingId(null)
    setErrorMessage('')
  }

  function handleEdit(item: EquipmentItem) {
    setEditingId(item.id)
    setFormData({
      name: item.name || '',
      name_en: item.name_en || '',
      slug: item.slug || '',
      category: item.category || '',
      icon: item.icon || '',
      image_url: item.image_url || '',
      reference_image_url: item.reference_image_url || '',
      variations: item.variations ? JSON.stringify(item.variations, null, 2) : '',
      ai_prompt_keywords: (item.ai_prompt_keywords || []).join(', '),
      is_serving_container: item.is_serving_container || false,
      serving_container_type: item.serving_container_type || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formData.name || !formData.name_en || !formData.slug || !formData.category) {
      setErrorMessage('Please fill required fields: name, name_en, slug and category.')
      return
    }

    let variations: any = null
    if (formData.variations.trim()) {
      try {
        variations = JSON.parse(formData.variations)
      } catch (error) {
        setErrorMessage('Variations must be valid JSON.')
        return
      }
    }

    const keywords = formData.ai_prompt_keywords
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean)

    const payload = {
      name: formData.name,
      name_en: formData.name_en,
      slug: slugify(formData.slug),
      category: formData.category,
      icon: formData.icon,
      image_url: formData.image_url || null,
      reference_image_url: formData.reference_image_url || null,
      variations,
      ai_prompt_keywords: keywords,
      is_serving_container: formData.is_serving_container || false,
      serving_container_type: formData.is_serving_container ? (formData.serving_container_type || null) : null,
    }

    setSaving(true)
    setErrorMessage('')

    try {
      if (editingId) {
        const { error } = await supabase
          .from('equipment')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
        alert('Equipment updated successfully.')
      } else {
        const { error } = await supabase
          .from('equipment')
          .insert(payload)

        if (error) throw error
        alert('Equipment created successfully.')
      }

      resetForm()
      await loadEquipment()
    } catch (error: any) {
      console.error('Error saving equipment:', error)
      setErrorMessage(error?.message || 'Failed to save equipment')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this equipment item? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Equipment item deleted.')
      if (editingId === id) {
        resetForm()
      }
      await loadEquipment()
    } catch (error: any) {
      console.error('Error deleting equipment:', error)
      alert(error?.message || 'Failed to delete equipment item')
    }
  }

  const filteredEquipment = equipment.filter((item) => {
    const matchesTerm = [item.name, item.name_en, item.slug, item.category]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter ? item.category === categoryFilter : true
    return matchesTerm && matchesCategory
  })

  const sortCategories = Array.from(
    new Set(equipment.map((item) => item.category).filter(Boolean))
  ).sort()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-purple-600">🔧 Equipment Manager</h1>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </button>
              <button className="text-purple-600 font-semibold">Equipment</button>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-6">
            <h2 className="text-3xl font-bold">Equipment Manager</h2>
            <p className="text-gray-600 mt-1">
              Manage equipment records, upload image references, and keep slug/category metadata in sync.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
            <section className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">Equipment list</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {equipment.length} item(s) loaded, {filteredEquipment.length} visible.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
                    <input
                      type="search"
                      placeholder="Search name, slug, category"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All categories</option>
                      {sortCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-16 text-gray-600">Loading equipment...</div>
                ) : filteredEquipment.length === 0 ? (
                  <div className="text-center py-16 text-gray-600">No equipment items found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Slug</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Image</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Reference</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEquipment.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700">{item.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.name_en}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.category}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.slug}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded object-cover" />
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {item.reference_image_url ? (
                                <img src={item.reference_image_url} alt={`${item.name} reference`} className="h-10 w-10 rounded object-cover" />
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(item)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{editingId ? 'Edit Equipment' : 'Add Equipment'}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingId ? 'Update the selected equipment item.' : 'Create a new equipment record.'}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Total equipment: {equipment.length}
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name (BG) *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN) *</label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({
                          ...formData,
                          name_en: value,
                          slug: formData.slug === '' ? slugify(value) : formData.slug,
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="auto-generated from name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Select category</option>
                      {categoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      {sortCategories
                        .filter((category) => !categoryOptions.includes(category))
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="Emoji or icon code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL / Upload</label>
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) => setFormData({ ...formData, image_url: url })}
                      bucket="equipment"
                      pathPrefix="equipment/images"
                      uploadApiRoute="/api/equipment/upload-image"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Image URL / Upload</label>
                    <ImageUpload
                      value={formData.reference_image_url}
                      onChange={(url) => setFormData({ ...formData, reference_image_url: url })}
                      bucket="equipment"
                      pathPrefix="equipment/reference"
                      uploadApiRoute="/api/equipment/upload-image"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variations (JSON)</label>
                  <textarea
                    value={formData.variations}
                    onChange={(e) => setFormData({ ...formData, variations: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    placeholder='["small", "medium"] or {"size":"large"}'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI Prompt Keywords</label>
                  <input
                    type="text"
                    value={formData.ai_prompt_keywords}
                    onChange={(e) => setFormData({ ...formData, ai_prompt_keywords: e.target.value })}
                    placeholder="comma separated keywords"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate keywords with commas for AI prompt enrichment.</p>
                </div>

                {/* Serving Container */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={formData.is_serving_container || false}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        is_serving_container: e.target.checked,
                        serving_container_type: e.target.checked ? (prev.serving_container_type || '') : null,
                      }))}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#A80048' }}
                    />
                    Форма / Съд за сервиране
                  </label>

                  {formData.is_serving_container && (
                    <div style={{ marginTop: 12 }}>
                      <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                        Тип съд
                      </label>
                      <select
                        value={formData.serving_container_type || ''}
                        onChange={e => setFormData(prev => ({ ...prev, serving_container_type: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
                      >
                        <option value="">— Избери тип —</option>
                        <option value="pan">Тава / Форма за печене</option>
                        <option value="mold">Силиконова форма</option>
                        <option value="ring">Ринг / Обръч</option>
                        <option value="glass">Чаша / Буркан</option>
                        <option value="cup">Купичка / Рамекин</option>
                        <option value="tray">Поднос</option>
                        <option value="other">Друго</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Equipment' : 'Create Equipment'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Reset form
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
