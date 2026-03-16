'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, email')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      router.push('/login');
      return;
    }

    setUser(profile);
    setLoading(false);
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
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">
                🎂 KetoCakr Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
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
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Base Recipes</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">--</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Ready Recipes</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">--</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Users</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">--</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Dessert Types</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">--</p>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/dashboard/dessert-types')}
                className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition"
              >
                <div className="text-2xl mb-2">🏷️</div>
                <div className="font-semibold">Dessert Types</div>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/assembly-templates')}
                className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition"
              >
                <div className="text-2xl mb-2">📋</div>
                <div className="font-semibold">Assembly Templates</div>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/base-recipes')}
                className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition"
              >
                <div className="text-2xl mb-2">🍰</div>
                <div className="font-semibold">Base Recipes</div>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/ingredients')}
                className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition"
              >
                <div className="text-2xl mb-2">🥚</div>
                <div className="font-semibold">Ingredients</div>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/ready-recipes')}
                className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition"
              >
                <div className="text-2xl mb-2">🎂</div>
                <div className="font-semibold">Ready Recipes</div>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/users')}
                className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold">Users</div>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/analytics')}
                className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold">Analytics</div>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/settings')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-semibold">Settings</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
