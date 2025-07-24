'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '../../Lib/auth'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [hasExistingReport, setHasExistingReport] = useState(false)
  const [reportDate, setReportDate] = useState(null)

  useEffect(() => {
    // Check if user has completed profile
    const savedProfile = localStorage.getItem('userProfile')
    if (!savedProfile) {
      router.push('/profile')
    } else {
      setProfile(JSON.parse(savedProfile))
      
      // Check if there's an existing report
      const savedReport = localStorage.getItem('currentReport')
      if (savedReport) {
        const reportData = JSON.parse(savedReport)
        const profileData = JSON.parse(savedProfile)
        // Check if report matches current profile
        if (reportData.profileMatch === `${profileData.targetRole}-${profileData.targetLocation}-${profileData.yearsExperience}`) {
          setHasExistingReport(true)
          setReportDate(new Date(reportData.generatedAt).toLocaleDateString())
        }
      }
    }
  }, [router])

  const handleClearData = () => {
    if (confirm('Clear all your profile data? You\'ll need to create a new profile to generate reports.')) {
      localStorage.removeItem('userProfile')
      localStorage.removeItem('currentReport')
      alert('Your profile data has been cleared')
      router.push('/profile')
    }
  }

  const handleSignOut = async () => {
    // Clear localStorage on sign out for security
    localStorage.removeItem('userProfile')
    localStorage.removeItem('currentReport')
    await signOut()
    router.push('/')
  }

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="CompSherpa" className="w-8 h-8" />
            <span className="text-xl font-bold text-blue-600">CompSherpa</span>
          </div>
          <div className="flex gap-4">
            <div className="text-blue-600 font-medium">Dashboard</div>
            <button
              onClick={() => router.push('/profile')}
              className="text-gray-600 hover:text-blue-600"
            >
              Profile
            </button>
            <button
              onClick={() => router.push('/checklist')}
              className="text-gray-600 hover:text-blue-600"
            >
              Negotiation Checklist
            </button>
            <button
              onClick={() => router.push('/deliveries')}
              className="text-gray-600 hover:text-blue-600"
            >
              Deliveries
            </button>
            <button
              onClick={() => router.push('/resources')}
              className="text-gray-600 hover:text-blue-600"
            >
              Resource Library
            </button>
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email}! 🦬</h1>
              <p className="text-gray-600">Your AI-powered salary negotiation assistant</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Target Role</p>
              <p className="text-xl font-semibold">{profile.targetRole}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Experience</p>
                <p className="text-2xl font-bold">{profile.yearsExperience} years</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Location</p>
                <p className="text-2xl font-bold">{profile.targetLocation}</p>
              </div>
              <div className="text-4xl">📍</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Timeline</p>
                <p className="text-2xl font-bold">{profile.startDateGoal}</p>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">
              {hasExistingReport ? 'View Your Report' : 'Generate Your Report'}
            </h2>
            <p className="text-gray-600 mb-6 flex-grow">
              {hasExistingReport 
                ? `Last generated on ${reportDate}. View your personalized negotiation strategy.`
                : 'Get personalized salary insights and negotiation strategies based on your profile.'
              }
            </p>
            <div className="mt-auto">
              <button
                onClick={() => router.push('/report')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition font-semibold text-lg"
              >
                {hasExistingReport ? 'View Report →' : 'Generate Report →'}
              </button>
              {hasExistingReport && (
                <button
                  onClick={() => {
                    localStorage.removeItem('currentReport')
                    router.push('/report')
                  }}
                  className="w-full mt-3 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
                >
                  Generate Fresh Report
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Update Profile</h2>
            <p className="text-gray-600 mb-6 flex-grow">
              Keep your information current to get the most accurate recommendations.
            </p>
            <div className="mt-auto">
              <button
                onClick={() => router.push('/profile')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition font-semibold text-lg"
              >
                Edit Profile →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Regular Sherpa Deliveries 📧</h2>
            <p className="text-gray-600 mb-6 flex-grow">
              Set up automated salary reports delivered to your inbox on your preferred schedule.
            </p>
            <div className="mt-auto">
              <button
                onClick={() => router.push('/deliveries')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-semibold text-lg"
              >
                Setup Deliveries →
              </button>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Profile Summary</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Professional Info</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Degree: {profile.degreeType}</li>
                <li>• Current Role: {profile.currentRole || 'Not specified'}</li>
                <li>• Certifications: {profile.specialtyCertifications?.length || 0}</li>
                <li>• Leadership Experience: {profile.leadershipExperience ? 'Yes' : 'No'}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Preferences</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Setting: {profile.settingPreference}</li>
                <li>• Top Priority: {profile.topPriority || 'Not specified'}</li>
                <li>• Comfort Level: {profile.negotiationComfort || 'Not specified'}</li>
                <li>• Other Offers: {profile.otherOffers || 0}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Privacy & Data</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                🔒 Your profile data is stored locally on this device and used only to generate personalized negotiation strategies. 
                We don't store your personal information on our servers.
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div>
                <h3 className="font-semibold mb-1">Clear Profile Data</h3>
                <p className="text-sm text-gray-600">
                  Remove all your saved profile information from this device
                </p>
              </div>
              <button
                onClick={handleClearData}
                className="bg-red-100 text-red-700 px-6 py-2 rounded-lg hover:bg-red-200 transition font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear My Data
              </button>
            </div>

            <div className="border-t pt-4">
              <a 
                href="/privacy" 
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View our full privacy policy →
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}