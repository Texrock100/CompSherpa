'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../Lib/auth'

export default function Profile() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  // Enhanced form data structure
  const [formData, setFormData] = useState({
    // Step 1: Basic Info (existing fields)
    firstName: '', // ADD THIS LINE
    degreeType: '',
    yearsExperience: '',
    targetRole: '',
    targetLocation: '',
    settingPreference: '',
    startDateGoal: '',
    
    // Step 2: Professional Background (NEW)
    currentRole: '',
    specialtyCertifications: [],
    clinicalAreas: [],
    leadershipExperience: false,
    preceptorExperience: false,
    bilingualSkills: [],
    additionalStrengths: '',
    
    // Step 3: Current Situation (NEW)
    currentlyEmployed: true,
    reasonForChange: '',
    otherOffers: 0,
    willingToRelocate: false,
    familyConsiderations: '',
    
    // Step 4: Priorities & Preferences (NEW)
    topPriority: '',
    salaryExpectations: {
      minimum: '',
      target: '',
      current: ''
    },
    mustHaves: [],
    dealBreakers: [],
    negotiationComfort: '',
    
    // Step 5: Employer Details (NEW - if known)
    employerType: '',
    employerSize: '',
    unionized: false,
    ruralLocation: false,
    loanForgiveness: false
  })

  // Certification options
  const certificationOptions = [
    'CCRN', 'CEN', 'TNCC', 'PALS', 'ACLS', 'NRP', 
    'CNOR', 'CMSRN', 'OCN', 'PCCN', 'CMC', 'CSC'
  ]

  // Clinical area options
  const clinicalAreaOptions = [
    'ICU/Critical Care', 'Emergency', 'Med-Surg', 'Pediatrics',
    'Labor & Delivery', 'NICU', 'OR/PACU', 'Oncology',
    'Cardiac', 'Neuro', 'Psych', 'Home Health', 'Other'
  ]

  // Load existing profile data on mount
  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile)
      setFormData(prev => ({ ...prev, ...profileData }))
    }
  }, [user, router])

  const handleNext = () => {
    // Save progress to localStorage before moving to next step
    localStorage.setItem('userProfile', JSON.stringify(formData))
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    // Save progress to localStorage before moving to previous step
    localStorage.setItem('userProfile', JSON.stringify(formData))
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Save to localStorage for offline access
      localStorage.setItem('userProfile', JSON.stringify(formData))
      
      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      // Still navigate - localStorage backup exists
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name.includes('.')) {
      // Handle nested objects like salaryExpectations.minimum
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleArrayToggle = (arrayName, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].includes(value)
        ? prev[arrayName].filter(item => item !== value)
        : [...prev[arrayName], value]
    }))
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
            CompSherpa 🦬
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
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold">Build Your Negotiation Profile 🦬</h1>
              <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Your Privacy is Protected</h3>
                <p className="text-sm text-blue-800">
                  The information you share is used exclusively to generate your personalized negotiation strategy. 
                  Your data is processed securely by our AI advisor and is never sold, shared with employers, 
                  recruiters, or used for any purpose other than creating your report. We don't store your 
                  personal information after generating your report.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Let's start with the basics</h2>
                
                {/* First Name - ADD THIS BEFORE YOUR DEGREE FIELD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's your first name?
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Your first name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Degree Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's your highest nursing degree?
                  </label>
                  <select
                    name="degreeType"
                    value={formData.degreeType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select degree type</option>
                    <option value="ADN">ADN - Associate Degree in Nursing</option>
                    <option value="BSN">BSN - Bachelor of Science in Nursing</option>
                    <option value="MSN">MSN - Master of Science in Nursing</option>
                    <option value="DNP">DNP - Doctor of Nursing Practice</option>
                    <option value="Other">Other Healthcare Degree</option>
                  </select>
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of RN experience?
                  </label>
                  <input
                    type="number"
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="50"
                  />
                </div>

                {/* Target Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What role are you targeting?
                  </label>
                  <input
                    type="text"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleChange}
                    placeholder="e.g., FNP, ICU Nurse, or 'Exploring options'"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Not sure? Type "Exploring" and we'll show you multiple options
                  </p>
                </div>

                {/* Target Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Where do you want to work?
                  </label>
                  <textarea
                    name="targetLocation"
                    value={formData.targetLocation}
                    onChange={handleChange}
                    placeholder="e.g., Denver, CO; Austin, TX; or 'Flexible/Remote'"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                  />
                </div>

                {/* Setting Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred work setting?
                  </label>
                  <select
                    name="settingPreference"
                    value={formData.settingPreference}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select setting</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Clinic">Clinic/Office</option>
                    <option value="Both">Both/Flexible</option>
                    <option value="Remote">Remote/Telehealth</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Start Date Goal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When do you plan to start?
                  </label>
                  <select
                    name="startDateGoal"
                    value={formData.startDateGoal}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select timeframe</option>
                    <option value="ASAP">ASAP - Actively interviewing</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6-12 months">6-12 months</option>
                    <option value="1+ year">1+ year - Just researching</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Professional Background */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Tell us about your experience</h2>
                
                {/* Current Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's your current role?
                  </label>
                  <input
                    type="text"
                    name="currentRole"
                    value={formData.currentRole}
                    onChange={handleChange}
                    placeholder="e.g., ICU RN, ED Charge Nurse, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Specialty Certifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select your certifications (check all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {certificationOptions.map(cert => (
                      <label key={cert} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.specialtyCertifications.includes(cert)}
                          onChange={() => handleArrayToggle('specialtyCertifications', cert)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clinical Areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinical areas of experience (check all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {clinicalAreaOptions.map(area => (
                      <label key={area} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.clinicalAreas.includes(area)}
                          onChange={() => handleArrayToggle('clinicalAreas', area)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Leadership Experience */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="leadershipExperience"
                      checked={formData.leadershipExperience}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>I have leadership experience (charge nurse, supervisor, etc.)</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="preceptorExperience"
                      checked={formData.preceptorExperience}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>I have preceptor/teaching experience</span>
                  </label>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages spoken fluently (besides English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Spanish, Mandarin (separate with commas)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      const languages = e.target.value.split(',').map(l => l.trim()).filter(l => l)
                      setFormData(prev => ({ ...prev, bilingualSkills: languages }))
                    }}
                  />
                </div>

                {/* Additional Experience & Strengths */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us what makes you special! 🌟
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Share any unique experiences, achievements, or strengths not covered above
                  </p>
                  <textarea
                    name="additionalStrengths"
                    value={formData.additionalStrengths || ''}
                    onChange={handleChange}
                    placeholder="Examples:
• Led implementation of new EMR system saving $50k annually
• Developed orientation program that reduced turnover by 30%
• Published research on rural healthcare access
• Volunteer medical missions to Guatemala
• Champion for patient satisfaction (99th percentile scores)
• Experience with specific patient populations (veterans, indigenous, etc.)
• Special skills (wound care, dialysis, chemotherapy certified)
• Awards or recognition received"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="6"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This helps our AI understand your unique value and create stronger negotiation points
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Current Situation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Your current situation</h2>
                
                {/* Employment Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you currently employed?
                  </label>
                  <div className="space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="currentlyEmployed"
                        value="true"
                        checked={formData.currentlyEmployed === true}
                        onChange={() => setFormData(prev => ({ ...prev, currentlyEmployed: true }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="currentlyEmployed"
                        value="false"
                        checked={formData.currentlyEmployed === false}
                        onChange={() => setFormData(prev => ({ ...prev, currentlyEmployed: false }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>

                {/* Reason for Change */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary reason for seeking new position
                  </label>
                  <select
                    name="reasonForChange"
                    value={formData.reasonForChange}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select reason</option>
                    <option value="Career advancement">Career advancement</option>
                    <option value="Better compensation">Better compensation</option>
                    <option value="Work-life balance">Work-life balance</option>
                    <option value="Relocation">Relocation</option>
                    <option value="Toxic workplace">Leaving toxic environment</option>
                    <option value="New grad">New graduate seeking first position</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Other Offers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have other job offers?
                  </label>
                  <select
                    name="otherOffers"
                    value={formData.otherOffers}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="0">No other offers</option>
                    <option value="1">1 other offer</option>
                    <option value="2">2 other offers</option>
                    <option value="3+">3+ other offers</option>
                  </select>
                </div>

                {/* Relocation */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="willingToRelocate"
                      checked={formData.willingToRelocate}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>I'm willing to relocate for the right opportunity</span>
                  </label>
                </div>

                {/* Family Considerations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family considerations that might affect negotiations
                  </label>
                  <select
                    name="familyConsiderations"
                    value={formData.familyConsiderations}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select if applicable</option>
                    <option value="None">No family considerations</option>
                    <option value="Young children">Young children (need flexibility)</option>
                    <option value="School-age children">School-age children</option>
                    <option value="Eldercare">Eldercare responsibilities</option>
                    <option value="Spouse employment">Spouse employment considerations</option>
                    <option value="Other">Other family considerations</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Priorities & Preferences */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">What matters most to you?</h2>
                
                {/* Top Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's your #1 priority in your next position?
                  </label>
                  <select
                    name="topPriority"
                    value={formData.topPriority}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select top priority</option>
                    <option value="Salary">Maximum salary</option>
                    <option value="Work-life balance">Work-life balance</option>
                    <option value="Benefits">Comprehensive benefits</option>
                    <option value="Growth">Career growth opportunities</option>
                    <option value="Schedule">Schedule flexibility</option>
                    <option value="Culture">Positive work culture</option>
                  </select>
                </div>

                {/* Salary Expectations */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Salary expectations (helps us personalize your negotiation strategy)
                  </label>
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <p className="text-xs text-blue-800">
                      🔒 <strong>Private & Confidential:</strong> These numbers are only used by your AI advisor to calculate realistic targets and negotiation strategies. They're never shared externally.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Current/Recent</label>
                      <select
                        name="salaryExpectations.current"
                        value={formData.salaryExpectations.current}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select range</option>
                        <option value="<60k">Under $60k</option>
                        <option value="60-70k">$60-70k</option>
                        <option value="70-80k">$70-80k</option>
                        <option value="80-90k">$80-90k</option>
                        <option value="90-100k">$90-100k</option>
                        <option value="100-110k">$100-110k</option>
                        <option value="110k+">$110k+</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Minimum needed</label>
                      <input
                        type="text"
                        name="salaryExpectations.minimum"
                        value={formData.salaryExpectations.minimum}
                        onChange={handleChange}
                        placeholder="e.g., 110k"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Target goal</label>
                      <input
                        type="text"
                        name="salaryExpectations.target"
                        value={formData.salaryExpectations.target}
                        onChange={handleChange}
                        placeholder="e.g., 125k"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Must Haves */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Non-negotiables (check all that apply)
                  </label>
                  <div className="space-y-2">
                    {[
                      'No weekend call',
                      'No night shifts',
                      'CME funding',
                      'Flexible schedule',
                      'Remote work option',
                      'Loan forgiveness',
                      'Relocation assistance',
                      'Sign-on bonus',
                      'Retirement matching'
                    ].map(item => (
                      <label key={item} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.mustHaves.includes(item)}
                          onChange={() => handleArrayToggle('mustHaves', item)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Negotiation Comfort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How comfortable are you with negotiation?
                  </label>
                  <select
                    name="negotiationComfort"
                    value={formData.negotiationComfort}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select comfort level</option>
                    <option value="Very nervous">Very nervous - never done it</option>
                    <option value="Nervous">Nervous but willing to try</option>
                    <option value="Somewhat comfortable">Somewhat comfortable</option>
                    <option value="Confident">Confident negotiator</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 5: Employer Details */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">About the employer (if known)</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Skip any you don't know - this just helps us customize advice
                </p>
                
                {/* Employer Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of employer
                  </label>
                  <select
                    name="employerType"
                    value={formData.employerType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select if known</option>
                    <option value="Large hospital system">Large hospital system</option>
                    <option value="Community hospital">Community hospital</option>
                    <option value="Private practice">Private practice</option>
                    <option value="FQHC">FQHC/Community health center</option>
                    <option value="Urgent care">Urgent care</option>
                    <option value="Telehealth">Telehealth company</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Employer Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size of organization
                  </label>
                  <select
                    name="employerSize"
                    value={formData.employerSize}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select if known</option>
                    <option value="Small">Small (1-10 providers)</option>
                    <option value="Medium">Medium (11-50 providers)</option>
                    <option value="Large">Large (50+ providers)</option>
                    <option value="Enterprise">Enterprise (multiple locations)</option>
                  </select>
                </div>

                {/* Special Characteristics */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="unionized"
                      checked={formData.unionized}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Unionized workplace</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="ruralLocation"
                      checked={formData.ruralLocation}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Rural or underserved area</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="loanForgiveness"
                      checked={formData.loanForgiveness}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Eligible for loan forgiveness programs</span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              {/* Left side - Exit/Previous buttons */}
              <div className="flex gap-3">
                {/* Always visible exit button - LIGHT GRAY */}
                <button
                  type="button"
                  onClick={() => {
                    // Save current form data before exiting
                    localStorage.setItem('userProfile', JSON.stringify(formData))
                    router.push('/dashboard')
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {currentStep === 1 ? 'Back to Dashboard' : 'Save & Exit'}
                </button>
                
                {/* Show Previous button on steps 2-5 - SAME LIGHT GRAY */}
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                )}
              </div>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold transition shadow-lg hover:shadow-xl"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating your profile...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}