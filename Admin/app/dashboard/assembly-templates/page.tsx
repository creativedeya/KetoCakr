'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';

interface AssemblyTemplate {
  id: number;
  template_key: string;
  name: string;
  name_en: string;
  intro_text: string;
  soaking_required: boolean;
  compatible_dessert_types: number[];
  created_at: string;
  steps?: any[];
}

export default function AssemblyTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<AssemblyTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [language, setLanguage] = useState<'bg' | 'en'>('bg');

  const [formData, setFormData] = useState({
    template_key: '',
    name: '',
    name_en: '',
    intro_text: '',
    intro_text_bg: '',
    intro_text_en: '',
    instructions: '',
    instructions_bg: '',
    instructions_en: '',
    soaking_required: false,
    compatible_dessert_types: [] as number[],
  });

  useEffect(() => {
    checkAuth();
    loadTemplates();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    if (!profile?.is_admin) {
      router.push('/login');
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      console.log('[Assembly Templates Page] Loading templates...');

      const response = await fetch('/api/assembly-templates');
      if (!response.ok) throw new Error('Failed to load templates');

      const data = await response.json();
      console.log('[Assembly Templates Page] Loaded', data.data.length, 'templates');
      setTemplates(data.data);
    } catch (error) {
      console.error('[Assembly Templates Page] Load error:', error);
      showToast('Failed to load templates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleCreateTemplate = async () => {
    try {
      // Validation
      if (!formData.template_key.trim()) {
        showToast('Template key is required', 'error');
        return;
      }
      if (!formData.name.trim()) {
        showToast('Bulgarian name is required', 'error');
        return;
      }
      if (!formData.name_en.trim()) {
        showToast('English name is required', 'error');
        return;
      }

      setIsCreating(true);
      console.log('[Assembly Templates Page] Creating template:', formData.template_key);

      const response = await fetch('/api/assembly-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create template');
      }

      const data = await response.json();
      console.log('[Assembly Templates Page] Created template:', data.data.id);

      // Reset form and reload
      setFormData({
        template_key: '',
        name: '',
        name_en: '',
        intro_text: '',
        intro_text_bg: '',
        intro_text_en: '',
        instructions: '',
        instructions_bg: '',
        instructions_en: '',
        soaking_required: false,
        compatible_dessert_types: [],
      });
      setIsDialogOpen(false);
      await loadTemplates();
      showToast('Template created successfully', 'success');
    } catch (error: any) {
      console.error('[Assembly Templates Page] Create error:', error);
      showToast(error.message || 'Failed to create template', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      console.log('[Assembly Templates Page] Deleting template:', id);

      const response = await fetch(`/api/assembly-templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete template');

      console.log('[Assembly Templates Page] Deleted template:', id);
      await loadTemplates();
      showToast('Template deleted successfully', 'success');
    } catch (error: any) {
      console.error('[Assembly Templates Page] Delete error:', error);
      showToast(error.message || 'Failed to delete template', 'error');
    }
  };

  const getDisplayName = (template: AssemblyTemplate) => {
    return language === 'bg' ? template.name : template.name_en;
  };

  const translations = {
    bg: {
      title: 'Шаблони за асамблаж',
      create: 'Създай',
      noTemplates: 'Няма шаблони за асамблаж',
      createFirst: 'Създай първи шаблон',
      createDialog: 'Създай шаблон за асамблаж',
      templateKey: 'Ключ на шаблона',
      nameBg: 'Име (Български)',
      nameEn: 'Име (Английски)',
      introTextBg: 'Вводен текст (Български)',
      introTextEn: 'Вводен текст (Английски)',
      soakingRequired: 'Необходимо намокрување',
      edit: 'Редактирай',
      delete: 'Изтрий',
      steps: 'Стъпки',
    },
    en: {
      title: 'Assembly Templates',
      create: 'Create',
      noTemplates: 'No assembly templates yet',
      createFirst: 'Create First Template',
      createDialog: 'Create Assembly Template',
      templateKey: 'Template Key',
      nameBg: 'Name (Bulgarian)',
      nameEn: 'Name (English)',
      introTextBg: 'Intro Text (Bulgarian)',
      introTextEn: 'Intro Text (English)',
      soakingRequired: 'Soaking Required',
      edit: 'Edit',
      delete: 'Delete',
      steps: 'Steps',
    },
  };

  const t = translations[language];

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
                  {t.title}
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(language === 'bg' ? 'en' : 'bg')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            {language === 'bg' ? 'EN' : 'БГ'}
          </button>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            <Plus size={20} />
            {t.create}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white font-medium ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Create Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">{t.createDialog}</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 space-y-4">
              {/* Template Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.templateKey} *
                </label>
                <input
                  type="text"
                  placeholder="e.g., layered_assembly"
                  value={formData.template_key}
                  onChange={(e) =>
                    setFormData({ ...formData, template_key: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Bulgarian Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.nameBg} *
                </label>
                <input
                  type="text"
                  placeholder="Име на шаблона..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* English Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.nameEn} *
                </label>
                <input
                  type="text"
                  placeholder="Template name..."
                  value={formData.name_en}
                  onChange={(e) =>
                    setFormData({ ...formData, name_en: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Intro Text BG */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.introTextBg}
                </label>
                <textarea
                  placeholder="Вводен текст..."
                  value={formData.intro_text_bg}
                  onChange={(e) =>
                    setFormData({ ...formData, intro_text_bg: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Intro Text EN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.introTextEn}
                </label>
                <textarea
                  placeholder="Intro text..."
                  value={formData.intro_text_en}
                  onChange={(e) =>
                    setFormData({ ...formData, intro_text_en: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Soaking Required */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="soaking"
                  checked={formData.soaking_required}
                  onChange={(e) =>
                    setFormData({ ...formData, soaking_required: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="soaking" className="text-sm font-medium text-gray-700">
                  {t.soakingRequired}
                </label>
              </div>

              {/* Dialog Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCreateTemplate}
                  disabled={isCreating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:bg-purple-400"
                >
                  {isCreating && <Loader2 size={16} className="animate-spin" />}
                  {t.create}
                </button>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 mb-4">{t.noTemplates}</p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            {t.createFirst}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getDisplayName(template)}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Key: <code className="bg-gray-100 px-2 py-1 rounded">{template.template_key}</code>
                </p>
              </div>

              <div className="mb-4 text-sm text-gray-600">
                <p>
                  <span className="font-medium">{t.steps}:</span>{' '}
                  {template.steps?.length || 0}
                </p>
                {template.soaking_required && (
                  <p className="text-orange-600 font-medium mt-2">⏱️ {t.soakingRequired}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/assembly-templates/${template.id}`}
                  className="flex-1"
                >
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                    <Edit2 size={16} />
                    {t.edit}
                  </button>
                </Link>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      </main>
    </div>
  );
}
