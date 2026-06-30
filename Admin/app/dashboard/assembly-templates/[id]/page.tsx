'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, ChevronLeft } from 'lucide-react';
import AssemblyTemplateForm from './components/AssemblyTemplateForm';
import AssemblyStepsManager from './components/AssemblyStepsManager';

interface AssemblyTemplate {
  id: number;
  template_key: string;
  name: string;
  name_en: string;
  intro_text: string;
  intro_text_bg: string;
  intro_text_en: string;
  instructions: string;
  instructions_bg: string;
  instructions_en: string;
  soaking_required: boolean;
  compatible_dessert_types: number[];
  created_at: string;
  updated_at: string;
  steps?: any[];
}

export default function EditAssemblyTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const templateId = parseInt(params.id as string);

  const [template, setTemplate] = useState<AssemblyTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'steps'>('metadata');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    checkAuth();
    loadTemplate();
  }, [templateId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    if (!profile?.is_admin) router.push('/login');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const loadTemplate = async () => {
    try {
      setIsLoading(true);
      console.log('[Edit Assembly Template] Loading template:', templateId);

      const response = await fetch(`/api/assembly-templates/${templateId}`);
      if (!response.ok) throw new Error('Failed to load template');

      const data = await response.json();
      console.log('[Edit Assembly Template] Loaded template:', data.data.id);
      setTemplate(data.data);
    } catch (error) {
      console.error('[Edit Assembly Template] Load error:', error);
      showToast('Failed to load template', 'error');
      router.push('/dashboard/assembly-templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async (updatedTemplate: Partial<AssemblyTemplate>) => {
    try {
      setIsSaving(true);
      console.log('[Edit Assembly Template] Saving template:', templateId);

      const response = await fetch(`/api/assembly-templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTemplate),
      });

      if (!response.ok) throw new Error('Failed to save template');

      const data = await response.json();
      console.log('[Edit Assembly Template] Saved template:', data.data.id);
      setTemplate((prev) => prev ? { ...prev, ...data.data } : data.data);
      showToast('Template updated successfully', 'success');
    } catch (error) {
      console.error('[Edit Assembly Template] Save error:', error);
      showToast('Failed to save template', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStepsUpdated = async () => {
    await loadTemplate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Template not found</p>
          <button
            onClick={() => router.push('/dashboard/assembly-templates')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Templates
          </button>
        </div>
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
                <button
                  onClick={() => router.push('/dashboard/assembly-templates')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Assembly Templates
                </button>
                <span className="text-purple-600 font-semibold">Edit</span>
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

          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white font-medium z-50 ${
                toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {toast.message}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/assembly-templates')}
              className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Key: <code className="bg-gray-100 px-2 py-0.5 rounded">{template.template_key}</code>
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('metadata')}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'metadata'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Метаданни
              </button>
              <button
                onClick={() => setActiveTab('steps')}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'steps'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Стъпки ({template.steps?.length || 0})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'metadata' && (
            <AssemblyTemplateForm
              template={template}
              onSave={handleSaveTemplate}
              isSaving={isSaving}
              onStepsGenerated={handleStepsUpdated}
            />
          )}

          {activeTab === 'steps' && (
            <AssemblyStepsManager
              templateId={templateId}
              steps={template.steps || []}
              onStepsUpdated={handleStepsUpdated}
            />
          )}

        </div>
      </main>
    </div>
  );
}
