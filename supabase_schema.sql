-- Create the testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL,
  email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_short_code TEXT NOT NULL UNIQUE,
  company_description TEXT NOT NULL,
  application_date DATE NOT NULL,
  thanks_email_date DATE NOT NULL,
  interview_date DATE NOT NULL,
  journey_duration_days INTEGER NOT NULL,
  photo_1_url TEXT NOT NULL,
  photo_2_url TEXT NOT NULL,
  photo_3_url TEXT NOT NULL,
  testimonial_text TEXT NOT NULL,
  testimonial_role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: We store the image URLs directly since you will manually upload them to Supabase Storage and paste the links, or use a custom form.
