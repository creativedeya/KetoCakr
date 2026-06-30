'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Sweetener {
  id: string
  name_en: string
  name_bg: string
  icon: string
  source: 'natural' | 'synthetic' | 'semi-natural'
  price: 'low' | 'mid' | 'high'
  glycemic_index: number
  sweetness_ratio: number
  net_carbs_per_100g: number
  calories_per_gram: number
  keto: boolean
  taste_profile_en: string
  taste_profile_bg: string
  common_uses: string[]
  description_en: string
  description_bg: string
  pros_en: string[]
  pros_bg: string[]
  cons_en: string[]
  cons_bg: string[]
  recommended_combinations: string[]
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export default function SweetenersPage() {
  const [sweeteners, setSweeteners] = useState<Sweetener[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSweeteners()
  }, [])

  const fetchSweeteners = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('sweeteners')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setSweeteners(data || [])
    } catch (error) {
      console.error('Error fetching sweeteners:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>🍬 Sweeteners</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Manage sweetener comparison tool data</p>
        </div>
        <Link href="/dashboard/sweeteners/create">
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            + New Sweetener
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading...</div>
      ) : sweeteners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No sweeteners yet. <Link href="/dashboard/sweeteners/create" style={{ color: '#0066cc' }}>Create one!</Link>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Icon</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Source</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>GI</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Keto</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sweeteners.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontSize: '24px' }}>{s.icon}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: '500' }}>{s.name_en}</div>
                    {s.name_bg && <div style={{ fontSize: '12px', color: '#666' }}>{s.name_bg}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: s.source === 'natural' ? '#dcfce7' : s.source === 'synthetic' ? '#fee2e2' : '#fef3c7',
                      color: s.source === 'natural' ? '#166534' : s.source === 'synthetic' ? '#991b1b' : '#92400e'
                    }}>
                      {s.source}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600' }}>{s.glycemic_index}</td>
                  <td style={{ padding: '12px 16px' }}>{s.keto ? '✅' : '❌'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/dashboard/sweeteners/${s.id}`}>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        ✏️ Edit
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '30px' }}>
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Total</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{sweeteners.length}</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Active</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{sweeteners.filter((s) => s.is_active).length}</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Keto</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{sweeteners.filter((s) => s.keto).length}</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Natural</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{sweeteners.filter((s) => s.source === 'natural').length}</div>
        </div>
      </div>
    </div>
  )
}