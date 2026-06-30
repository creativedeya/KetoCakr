'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Users, Search, Shield, Ban, Trash2, Crown, Calendar, Mail } from 'lucide-react';

type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  role: string;
  // Custom fields (if you have profiles table)
  subscription_type?: 'free' | 'pro';
  is_banned?: boolean;
  display_name?: string;
};

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'free' | 'pro'>('all');
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    pro: 0,
    activeThisMonth: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, subscription_type, is_banned, created_at, is_admin')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Users] Error loading profiles:', error);
        throw error;
      }

      const usersData: User[] = (profiles || []).map((p: any) => ({
        id: p.id,
        email: p.email || '',
        created_at: p.created_at,
        last_sign_in_at: p.created_at,
        role: p.is_admin ? 'admin' : 'authenticated',
        subscription_type: p.subscription_type || 'free',
        is_banned: p.is_banned || false,
        display_name: p.display_name || null,
      }));

      setUsers(usersData);
      calculateStats(usersData);
    } catch (error) {
      console.error('[Users] Error loading:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(userList: User[]) {
    const total = userList.length;
    const free = userList.filter(u => u.subscription_type === 'free').length;
    const pro = userList.filter(u => u.subscription_type === 'pro').length;
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeThisMonth = userList.filter(u => 
      new Date(u.last_sign_in_at || u.created_at) > thirtyDaysAgo
    ).length;

    setStats({ total, free, pro, activeThisMonth });
  }

  async function banUser(userId: string, email: string) {
    // TODO: Implement via API route with service role key
    alert('⚠️ Ban User функцията изисква API route с service role key.\n\nЗа production трябва да създадеш:\n/api/users/ban - POST endpoint');
    return;
  }

  async function deleteUser(userId: string, email: string) {
    // TODO: Implement via API route with service role key
    alert('⚠️ Delete User функцията изисква API route с service role key.\n\nЗа production трябва да създадеш:\n/api/users/delete - POST endpoint');
    return;
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterRole === 'all' || user.subscription_type === filterRole;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 font-medium">Users</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">👥 Users Management</h1>
        <p className="text-gray-600">Управление на потребители и абонаменти</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users size={24} />
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-blue-100">Total Users</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Shield size={24} />
            <span className="text-2xl font-bold">{stats.free}</span>
          </div>
          <p className="text-green-100">Free Users</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Crown size={24} />
            <span className="text-2xl font-bold">{stats.pro}</span>
          </div>
          <p className="text-purple-100">Pro Users</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={24} />
            <span className="text-2xl font-bold">{stats.activeThisMonth}</span>
          </div>
          <p className="text-orange-100">Active This Month</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {/* Filter */}
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">All Subscriptions</option>
              <option value="free">Free Only</option>
              <option value="pro">Pro Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Sign In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="font-medium">{user.email}</span>
                      </div>
                      {user.display_name && (
                        <p className="text-sm text-gray-500 mt-1">{user.display_name}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">ID: {user.id.substring(0, 8)}...</p>
                    </div>
                  </td>

                  {/* Subscription */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.subscription_type === 'pro'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.subscription_type === 'pro' ? (
                        <>
                          <Crown size={12} />
                          Pro
                        </>
                      ) : (
                        'Free'
                      )}
                    </span>
                  </td>

                  {/* Registered */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('bg-BG')}
                  </td>

                  {/* Last Sign In */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString('bg-BG')
                      : 'Never'}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.is_banned
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!user.is_banned && (
                        <button
                          onClick={() => banUser(user.id, user.email)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Ban User"
                        >
                          <Ban size={18} />
                        </button>
                      )}

                      <button
                        onClick={() => deleteUser(user.id, user.email)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ℹ️ <strong>Текущо състояние:</strong> Страницата използва mock data за демонстрация. 
          За production, трябва да създадеш API routes с service role key за:
        </p>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
          <li>GET /api/users - List real users from auth.users</li>
          <li>POST /api/users/ban - Ban user functionality</li>
          <li>POST /api/users/delete - Delete user functionality</li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 mb-3">
          💡 <strong>Quick Stats:</strong>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Conversion Rate:</span>
            <p className="font-bold text-blue-600">
              {stats.total > 0 ? Math.round((stats.pro / stats.total) * 100) : 0}%
            </p>
          </div>
          <div>
            <span className="text-gray-600">Active Users:</span>
            <p className="font-bold text-green-600">
              {stats.activeThisMonth} / {stats.total}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Growth This Month:</span>
            <p className="font-bold text-purple-600">+{stats.activeThisMonth}</p>
          </div>
          <div>
            <span className="text-gray-600">Pro Revenue:</span>
            <p className="font-bold text-orange-600">{stats.pro * 9.99} BGN/mo</p>
          </div>
        </div>
      </div>
    </div>
  );
}