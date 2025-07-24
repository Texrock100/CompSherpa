import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { profile, userId, email } = await request.json()
    
    console.log('Saving profile for:', { userId, email })
    console.log('Profile data:', profile)
    
    // Map camelCase to snake_case for database
    const profileForDb = {
      user_id: userId,
      email: email || profile.email,
      degree_type: profile.degreeType,
      years_experience: profile.yearsExperience,
      target_role: profile.targetRole,
      target_location: profile.targetLocation,
      setting_preference: profile.settingPreference,
      start_date_goal: profile.startDateGoal,
      current_position: profile.currentRole,
      graduation_date: profile.graduationDate,
      additional_strengths: profile.additionalStrengths,
      specialty_certifications: profile.specialtyCertifications,
      clinical_areas: profile.clinicalAreas,
      leadership_experience: profile.leadershipExperience,
      preceptor_experience: profile.preceptorExperience,
      bilingual_skills: profile.bilingualSkills,
      currently_employed: profile.currentlyEmployed,
      reason_for_change: profile.reasonForChange,
      other_offers: profile.otherOffers === '3+' ? 3 : parseInt(profile.otherOffers) || 0,
      willing_to_relocate: profile.willingToRelocate,
      family_considerations: profile.familyConsiderations,
      top_priority: profile.topPriority,
      salary_expectations: profile.salaryExpectations,
      must_haves: profile.mustHaves,
      deal_breakers: profile.dealBreakers,
      negotiation_comfort: profile.negotiationComfort,
      employer_type: profile.employerType,
      employer_size: profile.employerSize,
      unionized: profile.unionized,
      rural_location: profile.ruralLocation,
      loan_forgiveness: profile.loanForgiveness
    }
    
    // Check if profile exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()
    
    let result
    
    if (existing) {
      // Update existing profile
      console.log('Updating existing profile for user:', userId) 
      result = await supabase
        .from('user_profiles')
        .update({
          ...profileForDb,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
    } else {
      // Create new profile
      console.log('Creating new profile for user:', userId)
      result = await supabase
        .from('user_profiles')
        .insert([profileForDb])
        .select()
    }
    console.log('Supabase result:', result)
    
    if (result.error) {
      console.error('Supabase error:', result.error)
      return Response.json({ 
        error: result.error.message,
        details: result.error.details,
        code: result.error.code 
      }, { status: 400 })
    }
    
    return Response.json({ success: true, data: result.data })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}