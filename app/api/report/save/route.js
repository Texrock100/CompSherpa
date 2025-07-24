import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { report, profile, userId } = await request.json()
    
    console.log('Saving report for user:', userId)
    
    // Save report to database
    const { data, error } = await supabase
      .from('reports')
      .insert([{
        user_id: userId,
        profile_snapshot: profile,
        report_data: report,
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ 
        error: error.message,
        details: error.details,
        code: error.code 
      }, { status: 400 })
    }
    
    return Response.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Failed to save report' }, { status: 500 })
  }
}