-- Add profile_completed field to track if user has completed initial profile setup
ALTER TABLE public.profiles
ADD COLUMN profile_completed boolean DEFAULT false NOT NULL;

-- Update existing profiles to have profile_completed = true if they have a name
-- (assuming existing users already completed their profiles)
UPDATE public.profiles
SET profile_completed = true
WHERE name IS NOT NULL;
