'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface DessertType {
  id: number;
  name: string;
  name_en: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export default function DessertTypesPage() {
  const [types, setTypes] = useState<DessertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    description: '',
    image_url: '',
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadTypes();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    }
  }

  async function loadTypes() {
    try {
      const { data, error } = await supabase
        .from('dessert_types')
        .select('*')
        .order('name_en');

      if (error) throw error;
      setTypes(data || []);
    } catch (error) {
      console.error('Error loading types:', error);
      alert('Failed to load dessert types');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      name_en: '',
      description: '',
      image_url: '',
    });
    setImagePreview(null);
    setEditingId(null);
  }

  function handleEdit(type: DessertType) {
    setFormData({
      name: type.name || '',
      name_en: type.name_en || '',
      description: type.description || '',
      image_url: type.image_url || '',
    });
    setImagePreview(type.image_url || null);
    setEditingId(type.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.name_en) {
      alert('Please fill in required fields (Bulgarian and English names)');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('dessert_types')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        alert('Dessert type updated!');
      } else {
        const { error } = await supabase
          .from('dessert_types')
          .insert(formData);

        if (error) throw error;
        alert('Dessert type created!');
      }

      resetForm();
      loadTypes();
    } catch (error: any) {
      console.error('Error saving type:', error);
      alert(error.message || 'Failed to save dessert type');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this dessert type? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('dessert_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Dessert type deleted!');
      loadTypes();
    } catch (error: any) {
      console.error('Error deleting type:', error);
      alert(error.message || 'Failed to delete dessert type');
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `dessert-types/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('public-images')
      .upload(filePath, file);
    
    if (error) {
      console.error('Upload error:', error);
      return;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('public-images')
      .getPublicUrl(filePath);
    
    setFormData({ ...formData, image_url: publicUrl });
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
                  Dessert Types
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
            <h2 className="text-3xl font-bold">Dessert Types</h2>
            <p className="text-gray-600 mt-1">
              Manage dessert categories (cake, cheesecake, tart, etc.)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingId ? 'Edit Type' : 'Add New Type'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (Bulgarian) *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Торта"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Cake"
                      required
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
                      rows={3}
                      placeholder="Optional description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Upload
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {imagePreview && (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="mt-2 w-32 h-32 object-cover rounded border border-gray-200" 
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Or paste image URL directly"
                    />
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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Names
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {types.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No dessert types yet. Create one to get started!
                        </td>
                      </tr>
                    ) : (
                      types.map((type) => (
                        <tr key={type.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            {type.image_url ? (
                              <img 
                                src={type.image_url} 
                                alt={type.name_en} 
                                className="w-16 h-16 object-cover rounded" 
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                No image
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{type.name}</div>
                              <div className="text-gray-500">{type.name_en}</div>
                              {type.description && (
                                <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                  {type.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleEdit(type)}
                              className="text-purple-600 hover:text-purple-900 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(type.id)}
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
      </main>
    </div>
  );
}
