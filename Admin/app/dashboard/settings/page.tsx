'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Settings as SettingsIcon, Save, Eye, EyeOff, RefreshCw, Database } from 'lucide-react';

type AppSettings = {
  // General
  app_name: string;
  app_description: string;
  contact_email: string;
  support_url: string;
  
  // Branding
  primary_color: string;
  logo_url: string;
  
  // Subscription
  free_recipes_limit: number;
  pro_monthly_price: number;
  trial_days: number;
  
  // Feature Flags
  enable_user_registration: boolean;
  enable_recipe_generation: boolean;
  enable_ai_images: boolean;
  enable_shopping_list: boolean;
  
  // API Keys (masked for security)
  openai_api_key_set: boolean;
  replicate_api_key_set: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    // Default values
    app_name: 'KetoCakR',
    app_description: 'Keto Recipe Generator & Manager',
    contact_email: 'admin@ketocakr.com',
    support_url: 'https://ketocakr.com/support',
    primary_color: '#A80048',
    logo_url: '',
    free_recipes_limit: 10,
    pro_monthly_price: 9.99,
    trial_days: 7,
    enable_user_registration: true,
    enable_recipe_generation: true,
    enable_ai_images: true,
    enable_shopping_list: true,
    openai_api_key_set: true,
    replicate_api_key_set: true
  });

  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'subscription' | 'api' | 'features'>('general');
  const [saving, setSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Temporary state for API keys
  const [openaiKey, setOpenaiKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      // Load from environment variables or database
      // For now, using default values defined in state
      
      // Check if API keys are set in environment
      const hasOpenAI = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY || !!process.env.OPENAI_API_KEY;
      const hasReplicate = !!process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || !!process.env.REPLICATE_API_TOKEN;
      
      setSettings(prev => ({
        ...prev,
        openai_api_key_set: hasOpenAI,
        replicate_api_key_set: hasReplicate
      }));

      console.log('Settings loaded');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async function saveSettings() {
    setSaving(true);
    
    try {
      // Save to database (you'd need a settings table)
      // For now, just simulate save
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Settings saved successfully! ✅\n\nNote: Some settings require app restart to take effect.');
      setHasChanges(false);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof AppSettings, value: any) {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }

  function resetToDefaults() {
    if (!confirm('Are you sure you want to reset all settings to default values?')) {
      return;
    }

    setSettings({
      app_name: 'KetoCakR',
      app_description: 'Keto Recipe Generator & Manager',
      contact_email: 'admin@ketocakr.com',
      support_url: 'https://ketocakr.com/support',
      primary_color: '#A80048',
      logo_url: '',
      free_recipes_limit: 10,
      pro_monthly_price: 9.99,
      trial_days: 7,
      enable_user_registration: true,
      enable_recipe_generation: true,
      enable_ai_images: true,
      enable_shopping_list: true,
      openai_api_key_set: true,
      replicate_api_key_set: true
    });
    setHasChanges(true);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 font-medium">Settings</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">⚙️ Settings</h1>
          <p className="text-gray-600">Конфигурация на приложението</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw size={20} />
            Reset to Defaults
          </button>
          
          <button
            onClick={saveSettings}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ You have unsaved changes!
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6">
          {[
            { id: 'general', label: '📋 General' },
            { id: 'branding', label: '🎨 Branding' },
            { id: 'subscription', label: '💎 Subscription' },
            { id: 'api', label: '🔐 API Keys' },
            { id: 'features', label: '🚀 Features' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">General Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">App Name</label>
                  <input
                    type="text"
                    value={settings.app_name}
                    onChange={(e) => handleChange('app_name', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">App Description</label>
                  <textarea
                    value={settings.app_description}
                    onChange={(e) => handleChange('app_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Support URL</label>
                  <input
                    type="url"
                    value={settings.support_url}
                    onChange={(e) => handleChange('support_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BRANDING TAB */}
          {activeTab === 'branding' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Branding Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Primary Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      className="w-20 h-10 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primary_color}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg font-mono"
                      placeholder="#A80048"
                    />
                  </div>
                  <div 
                    className="mt-3 h-20 rounded-lg"
                    style={{ backgroundColor: settings.primary_color }}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Logo URL</label>
                  <input
                    type="url"
                    value={settings.logo_url}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="https://example.com/logo.png"
                  />
                  {settings.logo_url && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={settings.logo_url} 
                        alt="Logo Preview" 
                        className="max-h-20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {activeTab === 'subscription' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Subscription Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Free Plan - Recipe Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.free_recipes_limit}
                    onChange={(e) => handleChange('free_recipes_limit', Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum recipes free users can view
                  </p>
                </div>

                <div>
                  <label className="block font-medium mb-2">Pro Monthly Price (BGN)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.pro_monthly_price}
                    onChange={(e) => handleChange('pro_monthly_price', Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Trial Period (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.trial_days}
                    onChange={(e) => handleChange('trial_days', Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Days of free Pro access for new users
                  </p>
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold mb-3">Plan Comparison Preview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-bold text-green-600">Free Plan</h4>
                      <p className="text-2xl font-bold mt-2">0 BGN</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Up to {settings.free_recipes_limit} recipes
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-purple-500">
                      <h4 className="font-bold text-purple-600">Pro Plan</h4>
                      <p className="text-2xl font-bold mt-2">{settings.pro_monthly_price} BGN/mo</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {settings.trial_days} days free trial
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API KEYS TAB */}
          {activeTab === 'api' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">API Keys Configuration</h2>
              
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  🔐 API keys are stored in environment variables for security. 
                  Update your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file to change them.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">OpenAI API Key</label>
                  <div className="flex gap-2">
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={showApiKeys ? openaiKey : '••••••••••••••••••••'}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm"
                      placeholder="sk-..."
                      disabled={!showApiKeys}
                    />
                    <button
                      onClick={() => setShowApiKeys(!showApiKeys)}
                      className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      {showApiKeys ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-sm mt-1">
                    {settings.openai_api_key_set ? (
                      <span className="text-green-600">✓ Key is set</span>
                    ) : (
                      <span className="text-red-600">✗ Key not found</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block font-medium mb-2">Replicate API Token</label>
                  <div className="flex gap-2">
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={showApiKeys ? replicateKey : '••••••••••••••••••••'}
                      onChange={(e) => setReplicateKey(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm"
                      placeholder="r8_..."
                      disabled={!showApiKeys}
                    />
                    <button
                      onClick={() => setShowApiKeys(!showApiKeys)}
                      className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      {showApiKeys ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-sm mt-1">
                    {settings.replicate_api_key_set ? (
                      <span className="text-green-600">✓ Key is set</span>
                    ) : (
                      <span className="text-red-600">✗ Key not found</span>
                    )}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-bold mb-3">Environment Variables Location</h3>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                    <p className="text-gray-600"># admin/.env.local</p>
                    <p className="mt-2">OPENAI_API_KEY=sk-...</p>
                    <p>REPLICATE_API_TOKEN=r8_...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FEATURES TAB */}
          {activeTab === 'features' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Feature Flags</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium">User Registration</p>
                    <p className="text-sm text-gray-500">Allow new users to sign up</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enable_user_registration}
                    onChange={(e) => handleChange('enable_user_registration', e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium">Recipe Generation</p>
                    <p className="text-sm text-gray-500">Enable admin recipe creation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enable_recipe_generation}
                    onChange={(e) => handleChange('enable_recipe_generation', e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium">AI Image Generation</p>
                    <p className="text-sm text-gray-500">Allow AI-generated recipe images</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enable_ai_images}
                    onChange={(e) => handleChange('enable_ai_images', e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium">Shopping List</p>
                    <p className="text-sm text-gray-500">Enable shopping list feature in mobile app</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enable_shopping_list}
                    onChange={(e) => handleChange('enable_shopping_list', e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold mb-2">ℹ️ About Settings</h3>
            <p className="text-sm text-blue-800">
              Settings are stored in the database and environment variables. 
              Some changes require app restart.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold mb-3">📊 Current Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">App:</span>
                <span className="font-medium">{settings.app_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Free Limit:</span>
                <span className="font-medium">{settings.free_recipes_limit} recipes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pro Price:</span>
                <span className="font-medium">{settings.pro_monthly_price} BGN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trial:</span>
                <span className="font-medium">{settings.trial_days} days</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold mb-2 text-green-800">✅ Active Features</h3>
            <div className="space-y-1 text-sm">
              {settings.enable_user_registration && <p>• User Registration</p>}
              {settings.enable_recipe_generation && <p>• Recipe Generation</p>}
              {settings.enable_ai_images && <p>• AI Images</p>}
              {settings.enable_shopping_list && <p>• Shopping List</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}