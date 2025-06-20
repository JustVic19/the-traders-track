
-- Add skill_points column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN skill_points INTEGER NOT NULL DEFAULT 0;

-- Create skills table to track unlocked skills
CREATE TABLE public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_key TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_key)
);

-- Enable RLS on user_skills table
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_skills
CREATE POLICY "Users can view their own skills" 
  ON public.user_skills 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills" 
  ON public.user_skills 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to award skill points when user levels up
CREATE OR REPLACE FUNCTION public.award_skill_points_on_level_up()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If level increased, award skill points equal to the difference
  IF NEW.level > OLD.level THEN
    NEW.skill_points = OLD.skill_points + (NEW.level - OLD.level);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to automatically award skill points when leveling up
CREATE TRIGGER award_skill_points_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW 
  WHEN (NEW.level > OLD.level)
  EXECUTE FUNCTION public.award_skill_points_on_level_up();

-- Update updated_at trigger for user_skills
CREATE TRIGGER update_user_skills_updated_at
  BEFORE UPDATE ON public.user_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
