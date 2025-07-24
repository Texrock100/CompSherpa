'use client'

import { useAuth } from '../../Lib/auth'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function Report() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [profile, setProfile] = useState(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile')
    if (!savedProfile) {
      router.push('/profile')
      return
    }
    
    const profileData = JSON.parse(savedProfile)
    setProfile(profileData)
    
    // Check for cached report
    const savedReport = localStorage.getItem('currentReport')
    if (savedReport) {
      const reportData = JSON.parse(savedReport)
      if (reportData.profileMatch === `${profileData.targetRole}-${profileData.targetLocation}-${profileData.yearsExperience}`) {
        setReport(reportData)
        setLoading(false)
        return
      }
    }
    
    generateReport(profileData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateReport = async (profileData) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profileData,
          userId: user?.id
        })
      })
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }
      
      const data = await response.json()
      
      // Cache the report
      const reportToSave = {
        ...data,
        profileMatch: `${profileData.targetRole}-${profileData.targetLocation}-${profileData.yearsExperience}`,
        generatedAt: new Date().toISOString()
      }
      localStorage.setItem('currentReport', JSON.stringify(reportToSave))
      
      setReport(data)
      
      // Also save to Supabase if user is logged in
      if (user?.id) {
        try {
          const saveResponse = await fetch('/api/report/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              report: data.report,
              profile: profileData,
              userId: user?.id
            })
          })
          
          if (saveResponse.ok) {
            console.log('Report saved to database')
          }
        } catch (error) {
          console.error('Failed to save report to database:', error)
          // Continue anyway - report is still shown
        }
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    } finally {
      setLoading(false)
    }
  }



  // Helper function to safely render location
  const renderLocation = (location) => {
    if (typeof location === 'string') {
      return location
    } else if (typeof location === 'object' && location !== null) {
      return Object.values(location).join(', ')
    }
    return 'Location not specified'
  }

  const generatePDF = async () => {
    setGeneratingPDF(true)
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const margin = 10
      const contentWidth = pageWidth - (margin * 2)
      const contentHeight = pageHeight - (margin * 2)
      
      // Get all sections that should stay together
      const sections = document.querySelectorAll('#report-content > div')
      let currentY = margin
      let currentPage = 0
      
      // Add title page header
      pdf.setFontSize(20)
      pdf.setFont(undefined, 'bold')
      pdf.text('CompSherpa Salary Report', pageWidth / 2, currentY + 10, { align: 'center' })
      
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'normal')
      pdf.text(`${profile?.targetRole || 'Healthcare Professional'}`, pageWidth / 2, currentY + 20, { align: 'center' })
      pdf.text(`${renderLocation(profile?.targetLocation)} • ${profile?.yearsExperience || '0'} years experience`, pageWidth / 2, currentY + 27, { align: 'center' })
      
      pdf.setFontSize(10)
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY + 35, { align: 'center' })
      
      currentY = margin + 45
      
      // Process each section
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        
        // Skip navigation and footer
        if (section.classList.contains('no-print') || section.querySelector('nav')) {
          continue
        }
        
        // Hide buttons temporarily
        const buttons = section.querySelectorAll('button')
        buttons.forEach(btn => btn.style.display = 'none')
        
        // Capture the section
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: section.scrollWidth,
          height: section.scrollHeight
        })
        
        // Restore buttons
        buttons.forEach(btn => btn.style.display = '')
        
        // Calculate dimensions
        const imgWidth = contentWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        // Check if we need a new page
        if (currentY + imgHeight > contentHeight && currentPage > 0) {
          pdf.addPage()
          currentY = margin
          currentPage++
        }
        
        // Add the image
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          margin,
          currentY,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        )
        
        currentY += imgHeight + 5 // Add spacing between sections
        
        // If section is too tall for one page, handle overflow
        if (imgHeight > contentHeight) {
          const remainingHeight = imgHeight - (contentHeight - margin)
          let tempY = -contentHeight + margin
          
          while (remainingHeight + tempY > 0) {
            pdf.addPage()
            pdf.addImage(
              canvas.toDataURL('image/png'),
              'PNG',
              margin,
              tempY,
              imgWidth,
              imgHeight,
              undefined,
              'FAST'
            )
            tempY -= contentHeight - margin
            currentPage++
          }
          currentY = margin + (imgHeight + tempY)
        }
      }
      
      // Add footer to last page
      pdf.setFontSize(10)
      pdf.setTextColor(100)
      const footerY = pageHeight - margin
      pdf.text('Generated by CompSherpa.ai', pageWidth / 2, footerY - 5, { align: 'center' })
      pdf.text('Your AI-powered salary negotiation coach 🦬', pageWidth / 2, footerY, { align: 'center' })
      
      // Save the PDF
      const fileName = `CompSherpa_Report_${profile?.targetRole?.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try using the Print button to save as PDF from your browser.')
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">
            <img src="/icon.svg" alt="CompSherpa" className="w-24 h-24" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your sherpa is climbing...</h2>
          <p className="text-gray-600">Analyzing market data and creating your personalized strategy</p>
        </div>
      </main>
    )
  }

  if (!report || !report.report) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-4">Unable to Generate Report</h1>
            <p className="mb-4">Please check your profile and try again.</p>
            <button
              onClick={() => router.push('/profile')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          /* Hide navigation and buttons in print */
          nav, button, .no-print {
            display: none !important;
          }
          
          /* Page break controls */
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Ensure sections stay together */
          .bg-white, .rounded-2xl, .rounded-xl {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 1rem;
          }
          
          /* Grid items */
          .grid > div {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Lists */
          ul, ol {
            page-break-inside: avoid;
          }
          
          li {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Colors for print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Gradient backgrounds for print */
          .bg-gradient-to-r {
            background: #fffbeb !important;
          }
          
          /* Specific color backgrounds */
          .bg-blue-50 { background-color: #eff6ff !important; }
          .bg-indigo-50 { background-color: #eef2ff !important; }
          .bg-green-50 { background-color: #f0fdf4 !important; }
          .bg-blue-50 { background-color: #eff6ff !important; }
          .bg-purple-50 { background-color: #faf5ff !important; }
          .bg-yellow-50 { background-color: #fefce8 !important; }
          
          /* Text colors */
          .text-blue-600 { color: #2563eb !important; }
          .text-green-600 { color: #16a34a !important; }
          .text-blue-600 { color: #2563eb !important; }
          
          /* Page margins */
          @page {
            margin: 15mm;
          }
          
          /* Main content */
          main {
            background: white !important;
          }
          
          /* Spacing adjustments */
          .space-y-8 > * {
            margin-bottom: 1.5rem !important;
          }
        }
      `}</style>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-md sticky top-0 z-50 no-print">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              CompSherpa 🏔️
            </Link>
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/checklist" className="text-gray-600 hover:text-blue-600">
                Negotiation Checklist
              </Link>
              <Link href="/deliveries" className="text-gray-600 hover:text-blue-600">
                Deliveries
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-blue-600">
                Profile
              </Link>
              <button
                onClick={() => router.push('/resources')}
                className="text-gray-600 hover:text-blue-600"
              >
                Resource Library
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div id="report-content" className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 avoid-break">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Your Salary Negotiation Report</h1>
                  <p className="text-gray-600">
                    {profile?.targetRole} • {renderLocation(profile?.targetLocation)} • {profile?.yearsExperience} years experience
                  </p>
                </div>
                <div className="flex gap-2 no-print">
                  <button
                    onClick={generatePDF}
                    disabled={generatingPDF}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {generatingPDF ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Print
                  </button>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 avoid-break">
              <h2 className="text-2xl font-bold mb-4">Bottom Line Up Front</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Your Target Salary Range</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    ${report.report.salaryRange?.min?.toLocaleString() || '95,000'} - 
                    ${report.report.salaryRange?.max?.toLocaleString() || '125,000'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Median: ${report.report.salaryRange?.median?.toLocaleString() || '110,000'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Market Outlook</h3>
                  <div className="text-2xl font-bold text-green-600">High Demand</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Strong market for {profile?.targetRole} in your area
                  </p>
                </div>
              </div>
            </div>

            {/* Your Advantages */}
            {report.report.leveragePoints && report.report.leveragePoints.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 avoid-break">
                <h2 className="text-2xl font-bold mb-4">Your Unique Advantages 💪</h2>
                <div className="space-y-3">
                  {report.report.leveragePoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3 avoid-break">
                      <span className="text-green-600 text-xl">✓</span>
                      <p className="text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Analysis */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 avoid-break">
              <h2 className="text-2xl font-bold mb-4">Market Analysis</h2>
              <p className="text-gray-700 mb-4">
                {typeof report.report.marketAnalysis === 'object' ? 
                  JSON.stringify(report.report.marketAnalysis) : 
                  report.report.marketAnalysis}
              </p>
              
              {/* Role Comparison if exploring */}
              {report.isExploring && report.report.roleComparisons && Array.isArray(report.report.roleComparisons) && (
                <div className="mt-6 avoid-break">
                  <h3 className="text-xl font-semibold mb-4">Role Salary Comparison</h3>
                  <div className="space-y-3">
                    {report.report.roleComparisons.map((role, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg avoid-break">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{role.role}</span>
                          {role.recommended && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-blue-600">
                          ${(role.min || 0).toLocaleString()} - ${(role.max || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Negotiation Strategy */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 avoid-break">
              <h2 className="text-2xl font-bold mb-4">Your Negotiation Strategy 🎯</h2>
              
              {profile?.negotiationComfort && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6 avoid-break">
                  <p className="text-gray-700">
                    Since you're {profile.negotiationComfort.toLowerCase()}, we've tailored this approach to match your comfort level.
                  </p>
                </div>
              )}
              
              <ol className="space-y-4">
                {Array.isArray(report.report.negotiationTips) ? (
                  report.report.negotiationTips.map((tip, index) => (
                    <li key={index} className="flex gap-4 avoid-break">
                      <span className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <p className="text-gray-700">{tip}</p>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex gap-4 avoid-break">
                      <span className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                      <p className="text-gray-700">Research the market thoroughly and know your worth</p>
                    </li>
                    <li className="flex gap-4 avoid-break">
                      <span className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                      <p className="text-gray-700">Start with your ideal number, not your minimum</p>
                    </li>
                    <li className="flex gap-4 avoid-break">
                      <span className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                      <p className="text-gray-700">Consider the total compensation package, not just base salary</p>
                    </li>
                  </>
                )}
              </ol>
              
              <div className="mt-6 bg-blue-50 p-4 rounded-lg avoid-break">
                <p className="text-sm text-blue-800">
                  <strong>💡 Pro tip:</strong> See our sample negotiation checklist and the resource library for more ideas on negotiating the overall comp package.
                </p>
              </div>
            </div>



            {/* Benefits Beyond Salary */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 avoid-break">
              <h2 className="text-2xl font-bold mb-4">Beyond Base Salary 🎁</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg avoid-break">
                  <h3 className="font-semibold mb-2">Time Off & Flexibility</h3>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• PTO: Ask for 20+ days</li>
                    <li>• CME time: 5 days minimum</li>
                    <li>• Flexible scheduling</li>
                    <li>• Remote work options</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg avoid-break">
                  <h3 className="font-semibold mb-2">Professional Development</h3>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• CME funding: $2,000-3,000</li>
                    <li>• Certification renewals</li>
                    <li>• Conference attendance</li>
                    <li>• Mentorship programs</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg avoid-break">
                  <h3 className="font-semibold mb-2">Financial Benefits</h3>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• Sign-on bonus: $5,000-15,000</li>
                    <li>• Relocation assistance</li>
                    <li>• Retirement match: 4-6%</li>
                    <li>• Loan forgiveness eligibility</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg avoid-break">
                  <h3 className="font-semibold mb-2">Work Conditions</h3>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• Patient load limits</li>
                    <li>• Support staff ratio</li>
                    <li>• Call schedule</li>
                    <li>• Equipment/resources</li>
                  </ul>
                </div>
              </div>

              {/* Beyond Salary Benefits */}
              {report.report.beyondSalary && report.report.beyondSalary.length > 0 && (
                <div className="mt-6 bg-amber-50 p-6 rounded-xl avoid-break">
                  <h3 className="font-semibold mb-3">Additional Benefits to Negotiate</h3>
                  <div className="space-y-2">
                    {report.report.beyondSalary.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1">•</span>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Compensation */}
              <div className="mt-6 bg-amber-50 p-6 rounded-xl avoid-break">
                <h3 className="font-semibold mb-3">Total Compensation Value</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Salary</span>
                    <span className="font-semibold">
                      ${report.report.salaryRange?.median?.toLocaleString() || '110,000'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Benefits Value (estimated)</span>
                    <span>+$25,000-35,000</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total Package Value</span>
                    <span className="text-amber-600">
                      ${((report.report.salaryRange?.median || 110000) + 30000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Advertised Positions */}
            {report.report.comparablePositions && report.report.comparablePositions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 avoid-break">
                <h2 className="text-2xl font-bold mb-6">🎯 Advertised Positions</h2>
                
                <div className="space-y-4">
                  {report.report.comparablePositions.map((position, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{position.position}</h3>
                          <p className="text-gray-600">{position.employer} • {renderLocation(position.location || profile?.targetLocation)}</p>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          {position.relevanceScore}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{position.benefits}</p>
                      <p className="font-bold text-amber-600 mb-2">{position.salaryRange}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Posted: {position.datePosted}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Source: {position.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Research Sources */}
            {report.report.sourceBreakdown && report.report.sourceBreakdown.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 avoid-break">
                <h2 className="text-2xl font-bold mb-6">📚 Research Sources</h2>
                
                <div className="space-y-6">
                  {report.report.sourceBreakdown.map((source, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{source.source}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {source.lastUpdated}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">{source.dataPoints}</p>
                      <p className="font-bold text-amber-600 mb-2">{source.salaryRange}</p>
                      <p className="text-sm text-gray-500 mb-2">{source.keyFindings}</p>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
                        >
                          View Source →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* Alternative Career Paths */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 avoid-break">
              <h2 className="text-2xl font-bold mb-4">Alternative Career Paths 🔄</h2>
              
              <p className="text-gray-700 mb-6">
                Based on your {profile?.degreeType} degree and {profile?.yearsExperience} years of experience, 
                consider these alternative paths:
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Clinical Alternatives */}
                <div className="bg-blue-50 p-4 rounded-lg avoid-break">
                  <h3 className="font-semibold mb-3">Clinical Roles</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Telehealth {profile?.targetRole}</strong>
                      <div className="text-gray-600">Remote work, flexible hours</div>
                    </li>
                    <li>
                      <strong>Locum Tenens</strong>
                      <div className="text-gray-600">Higher pay, travel opportunities</div>
                    </li>
                    <li>
                      <strong>Urgent Care</strong>
                      <div className="text-gray-600">No call, predictable schedule</div>
                    </li>
                  </ul>
                </div>

                {/* Non-Clinical Options */}
                <div className="bg-green-50 p-4 rounded-lg avoid-break">
                  <h3 className="font-semibold mb-3">Non-Clinical Paths</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Clinical Education</strong>
                      <div className="text-gray-600">Teach future nurses</div>
                    </li>
                    <li>
                      <strong>Healthcare IT</strong>
                      <div className="text-gray-600">EMR implementation</div>
                    </li>
                    <li>
                      <strong>Case Management</strong>
                      <div className="text-gray-600">Regular hours, less stress</div>
                    </li>
                  </ul>
                </div>

                {/* Entrepreneurial */}
                <div className="bg-purple-50 p-4 rounded-lg avoid-break">
                  <h3 className="font-semibold mb-3">Entrepreneurial</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Private Practice</strong>
                      <div className="text-gray-600">Be your own boss</div>
                    </li>
                    <li>
                      <strong>Consulting</strong>
                      <div className="text-gray-600">Flexible, high earning</div>
                    </li>
                    <li>
                      <strong>Medical Writing</strong>
                      <div className="text-gray-600">Remote, creative</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 avoid-break">
              <h2 className="text-2xl font-bold mb-4">Your Next Steps ✅</h2>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold text-green-600">1.</span>
                  <span>Review this report and practice your negotiation scripts</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-600">2.</span>
                  <span>Research the specific employer and their benefits package</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-600">3.</span>
                  <span>Schedule your negotiation call during business hours when you're fresh</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-600">4.</span>
                  <span>Remember: The first offer is rarely the final offer!</span>
                </li>
              </ol>
            </div>

            {/* Footer */}
            <div className="text-center py-8 text-gray-600">
              <p>Generated by CompSherpa.ai • {new Date().toLocaleDateString()}</p>
              <p className="text-sm mt-2">Your AI-powered salary negotiation coach 🦬</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}