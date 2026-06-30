'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface SweetenerFormData {
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
}

export default function CreateSweetenerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<SweetenerFormData>({
    name_en: '',
    name_bg: '',
    icon: '🍬',
    source: 'natural',
    price: 'low',
    glycemic_index: 0,
    sweetness_ratio: 100,
    net_carbs_per_100g: 0,
    calories_per_gram: 0,
    keto: false,
    taste_profile_en: '',
    taste_profile_bg: '',
    common_uses: [],
    description_en: '',
    description_bg: '',
    pros_en: [],
    pros_bg: [],
    cons_en: [],
    cons_bg: [],
    recommended_combinations: [],
    is_active: true,
    display_order: 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from('sweeteners').insert([formData])
      if (error) throw error

      router.push('/dashboard/sweeteners')
    } catch (error) {
      console.error('Error creating sweetener:', error)
      alert('Error creating sweetener')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/dashboard/sweeteners" style={{ color: '#0066cc', textDecoration: 'none' }}>
          ← Back to Sweeteners
        </Link>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Create New Sweetener</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        
        {/* Basic Info */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>Basic Information</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Name (English) *</label>
            <input
              type="text"
              name="name_en"
              value={formData.name_en}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Name (Bulgarian)</label>
            <input
              type="text"
              name="name_bg"
              value={formData.name_bg}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Icon/Emoji</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              maxLength={2}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Classification */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>Classification</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Source *</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            >
              <option value="natural">Natural</option>
              <option value="synthetic">Synthetic</option>
              <option value="semi-natural">Semi-natural</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Price Level</label>
            <select
              name="price"
              value={formData.price}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            >
              <option value="low">💰 Low</option>
              <option value="mid">💰💰 Mid</option>
              <option value="high">💰💰💰 High</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Display Order</label>
            <input
              type="number"
              name="display_order"
              value={formData.display_order}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Nutritional Metrics */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>Nutritional Metrics</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Glycemic Index (0-100)</label>
            <input
              type="number"
              name="glycemic_index"
              value={formData.glycemic_index}
              onChange={handleChange}
              min="0"
              max="100"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Sweetness Ratio (vs sugar)</label>
            <input
              type="number"
              name="sweetness_ratio"
              value={formData.sweetness_ratio}
              onChange={handleChange}
              step="0.1"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Net Carbs per 100g</label>
            <input
              type="number"
              name="net_carbs_per_100g"
              value={formData.net_carbs_per_100g}
              onChange={handleChange}
              step="0.1"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Calories per Gram</label>
            <input
              type="number"
              name="calories_per_gram"
              value={formData.calories_per_gram}
              onChange={handleChange}
              step="0.1"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="keto"
                checked={formData.keto}
                onChange={handleChange}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>Keto Compatible</span>
            </label>
          </div>
        </div>

        {/* Descriptions */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>Description & Taste</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Description (English)</label>
            <textarea
              name="description_en"
              value={formData.description_en}
              onChange={handleChange}
              rows={4}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Description (Bulgarian)</label>
            <textarea
              name="description_bg"
              value={formData.description_bg}
              onChange={handleChange}
              rows={4}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Taste Profile (English)</label>
            <textarea
              name="taste_profile_en"
              value={formData.taste_profile_en}
              onChange={handleChange}
              rows={3}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Taste Profile (Bulgarian)</label>
            <textarea
              name="taste_profile_bg"
              value={formData.taste_profile_bg}
              onChange={handleChange}
              rows={3}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}
            />
          </div>
        </div>

        {/* Display Settings */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>Display Settings</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px' }}>Active (Visible in app)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <Link href="/dashboard/sweeteners">
            <button
              type="button"
              style={{
                padding: '10px 20px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Creating...' : 'Create Sweetener'}
          </button>
        </div>
      </form>
    </div>
  )
}