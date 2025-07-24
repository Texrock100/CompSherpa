import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  try {
    console.log('🧪 Testing database connection...')
    
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!hasUrl || !hasKey) {
      return Response.json({ 
        error: 'Missing environment variables',
        hasUrl,
        hasKey
      }, { status: 500 })
    }
    
    // Test user_profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true })
    
    // Test reports table
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('count', { count: 'exact', head: true })
    
    // Test email_signups table
    const { data: signups, error: signupsError } = await supabase
      .from('email_signups')
      .select('count', { count: 'exact', head: true })
    
    const errors = []
    if (profilesError) errors.push({ table: 'user_profiles', error: profilesError })
    if (reportsError) errors.push({ table: 'reports', error: reportsError })
    if (signupsError) errors.push({ table: 'email_signups', error: signupsError })
    
    if (errors.length > 0) {
      return Response.json({ 
        error: 'Database connection failed',
        details: errors
      }, { status: 500 })
    }
    
    // Test insert/delete on user_profiles (with a test record)
    const testUserId = 'test-' + Date.now()
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: testUserId,
        email: 'test@example.com',
        target_role: 'FNP'
      }])
    
    if (insertError) {
      return Response.json({ 
        error: 'Insert test failed',
        details: insertError
      }, { status: 500 })
    }
    
    // Clean up test record
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testUserId)
    
    return Response.json({ 
      success: true,
      message: 'Database connection and operations successful',
      tableCounts: {
        user_profiles: profiles,
        reports: reports,
        email_signups: signups
      },
      environment: {
        hasUrl,
        hasKey
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return Response.json({ 
      error: 'Database test failed',
      message: error.message
    }, { status: 500 })
  }
} 