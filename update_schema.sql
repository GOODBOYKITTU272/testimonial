-- Add new columns for the enhanced dashboard
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS job_role TEXT DEFAULT 'Other',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Interview Stage',
ADD COLUMN IF NOT EXISTS interview_type TEXT DEFAULT 'Technical Round',
ADD COLUMN IF NOT EXISTS consultant_name TEXT DEFAULT '';
