// ===========================================================
// FILE: admin/app/(dashboard)/page.tsx
// ===========================================================
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { Cake, Users, Layers, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    baseRecipes: 0,
    readyRecipes: 0,
    userRecipes: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [
      { count: totalUsers },
      { count: premiumUsers },
      { count: baseRecipes },
      { count: readyRecipes },
      { count: userRecipes },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_premium', true),
      supabase
        .from('base_recipes')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('ready_recipes')
        .select('*', { count: 'exact', head: true })
        .not('published_at', 'is', null),
      supabase
        .from('user_recipes')
        .select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      totalUsers: totalUsers || 0,
      premiumUsers: premiumUsers || 0,
      baseRecipes: baseRecipes || 0,
      readyRecipes: readyRecipes || 0,
      userRecipes: userRecipes || 0,
    });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Premium Users"
          value={stats.premiumUsers}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Base Recipes"
          value={stats.baseRecipes}
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Ready Recipes"
          value={stats.readyRecipes}
          icon={Cake}
          color="pink"
        />
      </div>

      {/* Quick Actions & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/base-recipes/new"
              className="block px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium"
            >
              Create Base Recipe
            </Link>
            <Link
              href="/ready-recipes/new"
              className="block px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium"
            >
              Create Ready Recipe
            </Link>
            <Link
              href="/users"
              className="block px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium"
            >
              Manage Users
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            <p className="text-gray-600">
              Total user-generated recipes:{' '}
              <strong className="text-gray-900">{stats.userRecipes}</strong>
            </p>
            <p className="text-gray-600">
              Conversion rate:{' '}
              <strong className="text-gray-900">
                {stats.totalUsers > 0
                  ? Math.round((stats.premiumUsers / stats.totalUsers) * 100)
                  : 0}
                %
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
  }[color];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}