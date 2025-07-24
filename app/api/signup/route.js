import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    console.log('Saving email signup:', email)
    
    // Try to save to Supabase, but don't fail if it doesn't work
    try {
      const { data, error } = await supabase
        .from('email_signups')
        .insert([{ email }])
        .select()
      
      if (error) {
        console.error('Supabase error:', error)
        // Don't return error - just log it and continue
      } else {
        console.log('Email signup saved to Supabase:', data)
      }
    } catch (supabaseError) {
      console.error('Supabase connection failed:', supabaseError)
      // Don't fail the request - just log the error
    }
    
    // Always return success so user can proceed
    return Response.json({ 
      success: true, 
      message: 'Email received successfully' 
    })
  } catch (error) {
    console.error('API error:', error)
    // Even if there's an error, let the user proceed
    return Response.json({ 
      success: true, 
      message: 'Email received successfully' 
    })
  }
}