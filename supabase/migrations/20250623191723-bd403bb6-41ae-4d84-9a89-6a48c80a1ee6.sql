
-- Create a secure function to invest focus points into skills
CREATE OR REPLACE FUNCTION public.invest_focus_points(
  skill_name_param TEXT,
  points_amount INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_focus_points INTEGER;
  current_skill_level INTEGER;
  current_skill_xp INTEGER;
  max_xp_for_level INTEGER;
  new_xp INTEGER;
  result JSON;
BEGIN
  -- Get user's current focus points
  SELECT focus_points INTO user_focus_points
  FROM profiles 
  WHERE id = auth.uid();
  
  -- Check if user has enough focus points
  IF user_focus_points < points_amount THEN
    result := json_build_object(
      'success', false,
      'error', 'Insufficient Focus Points'
    );
    RETURN result;
  END IF;
  
  -- Get current skill data
  SELECT skill_level, current_xp 
  INTO current_skill_level, current_skill_xp
  FROM user_skills 
  WHERE user_id = auth.uid() AND skill_name = skill_name_param;
  
  -- If skill doesn't exist
  IF NOT FOUND THEN
    result := json_build_object(
      'success', false,
      'error', 'Skill not found'
    );
    RETURN result;
  END IF;
  
  -- Check if skill is already at max level (5)
  IF current_skill_level >= 5 THEN
    result := json_build_object(
      'success', false,
      'error', 'Skill already at maximum level'
    );
    RETURN result;
  END IF;
  
  -- Calculate max XP for current level (level * 100)
  max_xp_for_level := current_skill_level * 100;
  
  -- Calculate new XP (cap at max for current level)
  new_xp := LEAST(current_skill_xp + points_amount, max_xp_for_level);
  
  -- Perform the transaction
  -- 1. Subtract focus points from user
  UPDATE profiles 
  SET focus_points = focus_points - points_amount, updated_at = now()
  WHERE id = auth.uid();
  
  -- 2. Add XP to the skill
  UPDATE user_skills 
  SET current_xp = new_xp, updated_at = now()
  WHERE user_id = auth.uid() AND skill_name = skill_name_param;
  
  -- Return success with updated values
  result := json_build_object(
    'success', true,
    'message', 'Focus Points invested successfully',
    'xp_gained', new_xp - current_skill_xp,
    'new_skill_xp', new_xp,
    'remaining_focus_points', user_focus_points - points_amount
  );
  RETURN result;
END;
$$;
