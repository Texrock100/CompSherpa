'use client'

import { useAuth } from '../../Lib/auth'
import { useRouter } from 'next/navigation'

export default function Waitlist() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">You're on the Waitlist! 🦬</h1>
            <p className="text-gray-600">
              Thanks for signing up, {user?.firstName}! We'll email you at <strong>{user?.primaryEmailAddress?.emailAddress}</strong> as soon as we're ready for you.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>What happens next?</strong> We're onboarding new users daily. 
              You'll receive an email within 24-48 hours with your access link.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Want earlier access? Share CompSherpa with fellow nurses!
            </p>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText('Check out CompSherpa - AI-powered salary negotiation for nurses! compsherpa.ai')
                alert('Link copied to clipboard!')
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium transition"
            >
              Copy Referral Link
            </button>

            <button
              onClick={handleSignOut}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Sign Out
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Questions? Email us at support@compsherpa.ai
          </p>
        </div>
      </div>
    </main>
  )
}