'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../Lib/auth'

export default function Deliveries() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deliverySettings, setDeliverySettings] = useState({
    enabled: false,
    frequency: 'monthly',
    email: user?.email || '',
    includeMarketUpdates: true,
    includeNewOpportunities: true,
    includeNegotiationTips: true
  })

  // Load existing delivery settings
  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    const savedSettings = localStorage.getItem('deliverySettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setDeliverySettings(prev => ({ ...prev, ...settings }))
    }
  }, [user, router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setDeliverySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Save to localStorage
      localStorage.setItem('deliverySettings', JSON.stringify(deliverySettings))
      
      // Call API to schedule/cancel deliveries
      const action = deliverySettings.enabled ? 'schedule' : 'cancel'
      const response = await fetch('/api/deliveries/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId: user?.id || 'test123',
          deliverySettings
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save delivery settings')
      }
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving delivery settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getFrequencyDescription = (frequency) => {
    switch (frequency) {
      case 'weekly':
        return 'Every Monday morning'
      case 'bi-weekly':
        return 'Every other Monday morning'
      case 'monthly':
        return 'First Monday of each month'
      case 'quarterly':
        return 'First Monday of each quarter'
      default:
        return ''
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">
            CompSherpa
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/checklist')}
              className="text-gray-600 hover:text-blue-600"
            >
              Negotiation Checklist
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="text-gray-600 hover:text-blue-600"
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Regular Sherpa Deliveries 📧</h1>
            <p className="text-gray-600">Set up automated salary reports and market insights delivered to your inbox</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold">Enable Regular Deliveries</h3>
                <p className="text-gray-600">Receive automated reports and updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={deliverySettings.enabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {deliverySettings.enabled && (
              <>
                {/* Frequency Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Frequency
                  </label>
                  <select
                    name="frequency"
                    value={deliverySettings.frequency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {getFrequencyDescription(deliverySettings.frequency)}
                  </p>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={deliverySettings.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Content Preferences */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">What to Include</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="includeMarketUpdates"
                        checked={deliverySettings.includeMarketUpdates}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-3 text-gray-700">Market updates and salary trends</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="includeNewOpportunities"
                        checked={deliverySettings.includeNewOpportunities}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-3 text-gray-700">New job opportunities in your area</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="includeNegotiationTips"
                        checked={deliverySettings.includeNegotiationTips}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-3 text-gray-700">Negotiation tips and strategies</span>
                    </label>
                  </div>
                </div>

                {/* Sample Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Sample Delivery Preview</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>📊 <strong>Market Update:</strong> Salary trends for {deliverySettings.frequency} period</p>
                    <p>💼 <strong>Opportunities:</strong> New positions matching your profile</p>
                    <p>💡 <strong>Negotiation Tip:</strong> Latest strategies and best practices</p>
                    <p>📈 <strong>Your Advantage:</strong> Personalized leverage points</p>
                  </div>
                </div>
              </>
            )}

            {/* Save Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !deliverySettings.enabled}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : saved ? 'Settings Saved! ✓' : 'Save Delivery Settings'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">How Regular Deliveries Work</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Reports are automatically generated based on your current profile</li>
                <li>• Market data is refreshed with each delivery</li>
                <li>• You can pause or modify settings at any time</li>
                <li>• Unsubscribe link included in every email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 