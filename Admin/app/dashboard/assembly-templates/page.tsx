'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AssemblyTemplate {
  id: number;
  template_key: string;
  name: string;
  name_en: string | null;
  description: string | null;
  instructions: string;
  instructions_bg: string | null;
  instructions_en: string | null;
  intro_text: string | null;
  intro_text_bg: string | null;
  intro_text_en: string | null;
  soaking_required: boolean;
  compatible_dessert_types: number[] | null;
  created_at: string;
  updated_at: string;
}

interface DessertType {
  id: number;
  name: string;
  name_en: string;
}

export default function AssemblyTemplatesPage() {
  const [templates, setTemplates] = useState<AssemblyTemplate[]>([]);
  const [dessertTypes, setDessertTypes] = useState<DessertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    template_key: '',
    name: '',
    name_en: '',
    description: '',
    instructions: '',
    instructions_bg: '',
    instructions_en: '',
    intro_text: '',
    intro_text_bg: '',
    intro_text_en: '',
    soaking_required: false,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    }
  }

  async function loadData() {
    try {
      // Load templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('assembly_templates')
        .select('*')
        .order('name');

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Load dessert types for selection
      const { data: typesData, error: typesError } = await supabase
        .from('dessert_types')
        .select('id, name, name_en')
        .order('name');

      if (typesError) throw typesError;
      setDessertTypes(typesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      template_key: '',
      name: '',
      name_en: '',
      description: '',
      instructions: '',
      instructions_bg: '',
      instructions_en: '',
      intro_text: '',
      intro_text_bg: '',
      intro_text_en: '',
      soaking_required: false,
    });
    setSelectedTypes([]);
    setEditingId(null);
  }

  function handleEdit(template: AssemblyTemplate) {
    setFormData({
      template_key: template.template_key || '',
      name: template.name || '',
      name_en: template.name_en || '',
      description: template.description || '',
      instructions: template.instructions || '',
      instructions_bg: template.instructions_bg || '',
      instructions_en: template.instructions_en || '',
      intro_text: template.intro_text || '',
      intro_text_bg: template.intro_text_bg || '',
      intro_text_en: template.intro_text_en || '',
      soaking_required: template.soaking_required || false,
    });
    setSelectedTypes(template.compatible_dessert_types || []);
    setEditingId(template.id);
  }

  function toggleDessertType(typeId: number) {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter(id => id !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.template_key || !formData.name) {
      alert('Please fill in required fields (template key and name)');
      return;
    }

    if (!formData.instructions_bg && !formData.instructions_en) {
      alert('Please provide instructions in at least one language (Bulgarian or English)');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        compatible_dessert_types: selectedTypes.length > 0 ? selectedTypes : null,
      };

      console.log('Attempting to save:', dataToSave);

      if (editingId) {
        const { data, error } = await supabase
          .from('assembly_templates')
          .update(dataToSave)
          .eq('id', editingId)
          .select();

        console.log('Update result:', { data, error });
        if (error) throw error;
        alert('Assembly template updated!');
      } else {
        const { data, error } = await supabase
          .from('assembly_templates')
          .insert(dataToSave)
          .select();

        console.log('Insert result:', { data, error });
        if (error) throw error;
        alert('Assembly template created!');
      }

      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving template:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert(error.message || error.hint || 'Failed to save assembly template');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this assembly template? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('assembly_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Assembly template deleted!');
      loadData();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      alert(error.message || 'Failed to delete assembly template');
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

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
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </button>
                <button className="text-purple-600 font-semibold">
                  Assembly Templates
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
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
          <div className="mb-6">
            <h2 className="text-3xl font-bold">Assembly Templates</h2>
            <p className="text-gray-600 mt-1">
              Manage assembly instructions for different dessert types
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 max-h-[85vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">
                  {editingId ? 'Edit Template' : 'Add New Template'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Key * <span className="text-gray-500 text-xs">(unique identifier)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.template_key}
                      onChange={(e) => setFormData({ ...formData, template_key: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="layer-cake, cheesecake-basic..."
                      required
                      disabled={editingId !== null}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (Bulgarian) *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Класическа торта на пластове"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (English)
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Classic Layer Cake"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={2}
                      placeholder="Short description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intro Text (Bulgarian)
                    </label>
                    <textarea
                      value={formData.intro_text_bg}
                      onChange={(e) => setFormData({ ...formData, intro_text_bg: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={2}
                      placeholder="Въведение на български..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intro Text (English)
                    </label>
                    <textarea
                      value={formData.intro_text_en}
                      onChange={(e) => setFormData({ ...formData, intro_text_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={2}
                      placeholder="Introduction in English..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assembly Instructions (Bulgarian) *
                    </label>
                    <textarea
                      value={formData.instructions_bg}
                      onChange={(e) => setFormData({ ...formData, instructions_bg: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={6}
                      placeholder="Стъпки за сглобяване на български..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assembly Instructions (English)
                    </label>
                    <textarea
                      value={formData.instructions_en}
                      onChange={(e) => setFormData({ ...formData, instructions_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={6}
                      placeholder="Step-by-step assembly instructions in English..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="soaking"
                      checked={formData.soaking_required}
                      onChange={(e) => setFormData({ ...formData, soaking_required: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="soaking" className="text-sm font-medium text-gray-700">
                      Soaking Required
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compatible Dessert Types
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {dessertTypes.map((type) => (
                        <div key={type.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`type-${type.id}`}
                            checked={selectedTypes.includes(type.id)}
                            onChange={() => toggleDessertType(type.id)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor={`type-${type.id}`} className="text-sm text-gray-700">
                            {type.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium"
                    >
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="max-h-[85vh] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Template
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Details
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {templates.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                            No assembly templates yet. Create one to get started!
                          </td>
                        </tr>
                      ) : (
                        templates.map((template) => (
                          <tr key={template.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{template.name}</div>
                                {template.name_en && (
                                  <div className="text-gray-500">{template.name_en}</div>
                                )}
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                                  {template.template_key}
                                </code>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-gray-600">
                                {template.soaking_required && (
                                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                                    Soaking
                                  </span>
                                )}
                                {template.compatible_dessert_types && template.compatible_dessert_types.length > 0 && (
                                  <div className="text-gray-500 mt-1">
                                    {template.compatible_dessert_types.length} compatible types
                                  </div>
                                )}
                                {template.description && (
                                  <div className="text-gray-400 mt-1 line-clamp-2">
                                    {template.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleEdit(template)}
                                className="text-purple-600 hover:text-purple-900 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(template.id)}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
