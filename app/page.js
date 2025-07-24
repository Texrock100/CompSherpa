'use client'
import { useState } from 'react'
import { useAuth } from '../Lib/auth'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleEmailSubmit = async () => {
    if (!email) return
    
    setLoading(true)
    try {
      // Save email to database
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      // Always proceed regardless of response
      setMessage('🦬 Welcome to the sherpa summit!')
      setEmail('')
      
      // Sign in the user
      const authResult = await signIn(email)
      
      // Redirect to profile setup after a short delay
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
      
    } catch (error) {
      console.error('Signup error:', error)
      // Even if there's an error, let the user proceed
      setMessage('🦬 Welcome to the sherpa summit!')
      setEmail('')
      
      // Sign in the user
      await signIn(email)
      
      // Redirect to profile setup
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-6 inline-block">
              <img src="/logo.svg" alt="CompSherpa" className="w-20 h-20" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Stop Accepting Scraps.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                Climb to Your Real Worth.
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Your personal salary sherpa guides you through the treacherous terrain of compensation, 
              helps you navigate the peaks of your worth, and leads you to the summit of your earning potential.
            </p>
            
            {/* Email Capture */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <input 
                type="email" 
                placeholder="Enter your email to begin your ascent"
                className="px-6 py-3 rounded-full border-2 border-blue-300 focus:outline-none focus:border-blue-500 w-full sm:w-96 text-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
              />
              <button 
                type="button"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-full hover:from-blue-600 hover:to-indigo-700 transition font-bold text-lg shadow-lg hover:shadow-xl"
                onClick={handleEmailSubmit}
                disabled={loading}
              >
                {loading ? 'Ascending...' : 'Begin Your Ascent 🦬'}
              </button>
            </div>
            
            {message && (
              <p className="text-green-600 font-medium mb-4">{message}</p>
            )}
            
            <p className="text-gray-600 flex items-center justify-center">
              <span className="text-2xl mr-2">🧗</span>
              <span>Join 732 sherpas already reaching new heights</span>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            How <span className="text-blue-500">CompSherpa</span> Works
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            From your data to your celebration - we've got you covered
          </p>
          
          {/* Process Steps */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center max-w-48">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Your Data Entry</h3>
              <p className="text-sm text-gray-600">Provide your info - the more detail, the better we can help</p>
            </div>
            
            {/* Arrow */}
            <div className="hidden lg:block text-2xl text-gray-400">→</div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center max-w-48">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-bold text-lg mb-2">AI Research</h3>
              <p className="text-sm text-gray-600">AI researches local market data for your specific position</p>
            </div>
            
            {/* Arrow */}
            <div className="hidden lg:block text-2xl text-gray-400">→</div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center max-w-48">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Your Report</h3>
              <p className="text-sm text-gray-600">Personalized analysis with market data, tips & scripts</p>
            </div>
            
            {/* Arrow */}
            <div className="hidden lg:block text-2xl text-gray-400">→</div>
            
            {/* Step 4 */}
            <div className="flex flex-col items-center text-center max-w-48">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Set Up Your Regular Searches</h3>
              <p className="text-sm text-gray-600">CompSherpa will conduct the search and regularly deliver updated results to your email inbox.</p>
            </div>
            
            {/* Arrow */}
            <div className="hidden lg:block text-2xl text-gray-400">→</div>
            
            {/* Step 5 */}
            <div className="flex flex-col items-center text-center max-w-48">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-bold text-lg mb-2">You Negotiate</h3>
              <p className="text-sm text-gray-600">Go into discussions with confidence & data-backed strategy</p>
            </div>
            
            {/* Arrow */}
            <div className="hidden lg:block text-2xl text-gray-400">→</div>
            
            {/* Step 6 */}
            <div className="flex flex-col items-center text-center max-w-48">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-bold text-lg mb-2">You Win!</h3>
              <p className="text-sm text-gray-600">Secure the compensation you deserve with confidence</p>
            </div>
          </div>
          
          {/* Key Features */}
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Market Analysis
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Comparable Positions
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Negotiation Scripts
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Total Comp Analysis
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Your <span className="text-blue-500">Sherpa Powers</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold mb-2">Expert Navigation</h3>
              <p className="text-gray-600">
                Guides you through the complex terrain of salary data
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Peak Performance</h3>
              <p className="text-gray-600">
                Sherpas know the best routes to reach your goals
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Smart Strategy</h3>
              <p className="text-gray-600">
                AI-powered negotiation tactics that actually work
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}