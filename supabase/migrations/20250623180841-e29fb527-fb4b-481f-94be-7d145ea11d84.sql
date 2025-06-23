
-- Add skill_points column to profiles table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='skill_points') THEN
        ALTER TABLE public.profiles ADD COLUMN skill_points INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Create user_skills table to track individual skill progress
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level INTEGER NOT NULL DEFAULT 1,
  current_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

-- Enable RLS on user_skills table
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_skills (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can insert their own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can update their own skills" ON public.user_skills;

CREATE POLICY "Users can view their own skills" 
  ON public.user_skills 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills" 
  ON public.user_skills 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills" 
  ON public.user_skills 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to create default skills for new users
CREATE OR REPLACE FUNCTION public.create_default_skills_for_user(user_profile_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Risk Management skills
  INSERT INTO public.user_skills (user_id, skill_name, skill_level, current_xp) VALUES
    (user_profile_id, 'Position Sizing', 1, 0),
    (user_profile_id, 'Stop Loss Mastery', 1, 0),
    (user_profile_id, 'Risk/Reward Optimization', 1, 0);
  
  -- Technical Analysis skills
  INSERT INTO public.user_skills (user_id, skill_name, skill_level, current_xp) VALUES
    (user_profile_id, 'Chart Pattern Recognition', 1, 0),
    (user_profile_id, 'Indicator Mastery', 1, 0),
    (user_profile_id, 'Support & Resistance', 1, 0);
  
  -- Psychology skills
  INSERT INTO public.user_skills (user_id, skill_name, skill_level, current_xp) VALUES
    (user_profile_id, 'Emotional Control', 1, 0),
    (user_profile_id, 'Discipline Mastery', 1, 0),
    (user_profile_id, 'FOMO Resistance', 1, 0);
END;
$$;

-- Update the existing handle_new_user function to create default skills
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, level, xp, alpha_coins, skill_points)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    1,
    0,
    100,
    0
  );
  
  -- Create default skills for the new user
  PERFORM create_default_skills_for_user(NEW.id);
  
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger for updated_at on user_skills
DROP TRIGGER IF EXISTS update_user_skills_updated_at ON public.user_skills;
CREATE TRIGGER update_user_skills_updated_at
  BEFORE UPDATE ON public.user_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
