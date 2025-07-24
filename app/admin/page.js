'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../Lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Add your admin emails here
const ADMIN_EMAILS = ['rockaway@hcgemail.com'] // Replace with your email

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    recentUsers: [],
    popularRoles: [],
    avgSalaryExpectations: {},
    recentReports: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin
    if (user && !ADMIN_EMAILS.includes(user.primaryEmailAddress?.emailAddress)) {
      router.push('/dashboard')
      return
    }

    fetchStats()
  }, [user, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl">Loading admin dashboard...</h2>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              CompSherpa
            </Link>
            <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">Admin</span>
          </div>
          <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
            Back to App
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalReports}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Avg Target Salary</h3>
            <p className="text-3xl font-bold text-blue-600">
              ${stats.avgSalaryExpectations.target ? Math.round(stats.avgSalaryExpectations.target).toLocaleString() : '0'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats.totalUsers > 0 ? Math.round((stats.totalReports / stats.totalUsers) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Popular Roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Most Popular Target Roles</h2>
            <div className="space-y-2">
              {stats.popularRoles.map((role, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{role.target_role || 'Not specified'}</span>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {role.count} users
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Recent Sign-ups</h2>
            <div className="space-y-2">
              {stats.recentUsers.map((user, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-gray-600">
                        {user.target_role} • {user.target_location}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Reports Generated</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentReports.map((report, index) => {
                  const profile = report.profile_snapshot || {}
                  return (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{profile.email || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm">{profile.targetRole || profile.target_role || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm">{profile.targetLocation || profile.target_location || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm">{profile.yearsExperience || profile.years_experience || '0'} yrs</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              // TODO: Implement CSV export
              alert('CSV export coming soon!')
            }}
                          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Export All Data to CSV
          </button>
        </div>
      </div>
    </main>
  )
}