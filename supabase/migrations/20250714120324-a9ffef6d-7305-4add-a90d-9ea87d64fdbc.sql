-- Add missing columns to user_skills table for proper skill progression tracking
ALTER TABLE public.user_skills 
ADD COLUMN skill_level INTEGER NOT NULL DEFAULT 1,
ADD COLUMN current_xp INTEGER NOT NULL DEFAULT 0,
ADD COLUMN max_xp INTEGER NOT NULL DEFAULT 100,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create trigger to automatically update max_xp when skill_level changes
CREATE OR REPLACE FUNCTION public.update_skill_max_xp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.max_xp = NEW.skill_level * 100;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skill_max_xp_trigger
  BEFORE UPDATE ON public.user_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_skill_max_xp();

-- Update existing user_skills records to have proper max_xp values
UPDATE public.user_skills 
SET max_xp = skill_level * 100, updated_at = now();

-- Add check constraints for data integrity
ALTER TABLE public.user_skills 
ADD CONSTRAINT skill_level_range CHECK (skill_level >= 1 AND skill_level <= 5),
ADD CONSTRAINT current_xp_range CHECK (current_xp >= 0 AND current_xp <= max_xp),
ADD CONSTRAINT max_xp_positive CHECK (max_xp > 0);