# Supabase Database Setup & Troubleshooting Guide

## Current Issues
The application is failing to save profiles and reports to Supabase due to:
1. **Missing database tables** - The required tables don't exist
2. **Column name mismatches** - Code expects different column names than what exists
3. **Table name inconsistencies** - Different parts of the code use different table names

## Step-by-Step Fix

### 1. Set Up Supabase Database Schema

1. **Go to your Supabase Dashboard**
   - Navigate to your project
   - Go to the "SQL Editor" section

2. **Run the Database Schema**
   - Copy the contents of `database-schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the schema

3. **Verify Tables Created**
   - Go to "Table Editor" in Supabase
   - You should see these tables:
     - `user_profiles`
     - `reports` 
     - `email_signups`

### 2. Environment Variables Check

Make sure these environment variables are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Test Database Connection

Create a simple test API to verify the connection:

```javascript
// app/api/test-db/route.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  try {
    // Test user_profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true })
    
    // Test reports table
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('count', { count: 'exact', head: true })
    
    if (profilesError || reportsError) {
      return Response.json({ 
        error: 'Database connection failed',
        profilesError,
        reportsError
      }, { status: 500 })
    }
    
    return Response.json({ 
      success: true,
      profilesCount: profiles,
      reportsCount: reports
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

### 4. Common Error Solutions

#### Error: "Could not find the 'profile_data' column"
**Solution**: The column name has been changed to `profile_snapshot` in the schema.

#### Error: "relation 'profiles' does not exist"
**Solution**: The table name is `user_profiles`, not `profiles`.

#### Error: "permission denied"
**Solution**: Check that Row Level Security (RLS) policies are properly configured.

### 5. Manual Database Verification

Run these queries in Supabase SQL Editor to verify setup:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'reports', 'email_signups');

-- Check table structure
\d user_profiles;
\d reports;

-- Test insert (optional)
INSERT INTO user_profiles (user_id, email, target_role) 
VALUES ('test123', 'test@example.com', 'FNP')
ON CONFLICT (user_id) DO NOTHING;
```

### 6. Debugging Steps

1. **Check Browser Console**
   - Look for network errors when saving profiles/reports
   - Check the response status and error messages

2. **Check Server Logs**
   - Look at the terminal where you're running `npm run dev`
   - Check for Supabase error messages

3. **Test Individual APIs**
   - Visit `/api/test-db` to test database connection
   - Check if environment variables are loaded correctly

### 7. Alternative: Use Local Storage Only

If Supabase continues to have issues, you can temporarily disable database saving:

1. **Modify `app/api/profile/save/route.js`**:
   ```javascript
   // Comment out the Supabase operations and just return success
   return Response.json({ success: true, data: { message: 'Profile saved locally' } })
   ```

2. **Modify `app/api/report/save/route.js`**:
   ```javascript
   // Comment out the Supabase operations and just return success
   return Response.json({ success: true, data: { message: 'Report saved locally' } })
   ```

### 8. Production Considerations

For production deployment:

1. **Set up proper RLS policies** for security
2. **Configure environment variables** in your hosting platform
3. **Set up database backups** in Supabase
4. **Monitor database performance** and add indexes as needed

## Quick Fix Summary

1. Run the `database-schema.sql` in Supabase SQL Editor
2. Verify environment variables are set
3. Test the `/api/test-db` endpoint
4. Try saving a profile/report again

The main issues were:
- ✅ Fixed table name from `profiles` to `user_profiles`
- ✅ Fixed column name from `profile_data` to `profile_snapshot`
- ✅ Created proper database schema with all required tables 