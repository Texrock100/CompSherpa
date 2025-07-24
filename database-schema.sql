-- CompSherpa Database Schema
-- Run this in your Supabase SQL editor to create the required tables

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create user_profiles table (for storing user profile data)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    email TEXT,
    first_name TEXT,
    degree_type TEXT,
    years_experience TEXT,
    target_role TEXT,
    target_location TEXT,
    setting_preference TEXT,
    start_date_goal TEXT,
    current_position TEXT,
    graduation_date TEXT,
    additional_strengths TEXT,
    specialty_certifications TEXT[],
    clinical_areas TEXT[],
    leadership_experience BOOLEAN DEFAULT false,
    preceptor_experience BOOLEAN DEFAULT false,
    bilingual_skills TEXT[],
    currently_employed BOOLEAN DEFAULT true,
    reason_for_change TEXT,
    other_offers INTEGER DEFAULT 0,
    willing_to_relocate BOOLEAN DEFAULT false,
    family_considerations TEXT,
    top_priority TEXT,
    salary_expectations JSONB,
    must_haves TEXT[],
    deal_breakers TEXT[],
    negotiation_comfort TEXT,
    employer_type TEXT,
    employer_size TEXT,
    unionized BOOLEAN DEFAULT false,
    rural_location BOOLEAN DEFAULT false,
    loan_forgiveness BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table (for storing generated reports)
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    profile_snapshot JSONB, -- Store the profile data used to generate the report
    report_data JSONB, -- Store the generated report data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_signups table (for newsletter signups)
CREATE TABLE IF NOT EXISTS email_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_email_signups_email ON email_signups(email);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to read/write their own profile
CREATE POLICY "Users can manage their own profile" ON user_profiles
    FOR ALL USING (auth.uid()::text = user_id);

-- Allow users to read/write their own reports
CREATE POLICY "Users can manage their own reports" ON reports
    FOR ALL USING (auth.uid()::text = user_id);

-- Allow anyone to sign up for emails
CREATE POLICY "Anyone can sign up for emails" ON email_signups
    FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO user_profiles (user_id, email, target_role, target_location) 
-- VALUES ('test123', 'test@example.com', 'FNP', 'Anchorage, AK'); 