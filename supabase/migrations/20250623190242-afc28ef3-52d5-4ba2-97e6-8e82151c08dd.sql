
-- Add focus_points column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN focus_points INTEGER NOT NULL DEFAULT 0;
