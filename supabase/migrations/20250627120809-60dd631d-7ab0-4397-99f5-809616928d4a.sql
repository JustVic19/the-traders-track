
-- Fix the create_default_skills_for_user function to use correct column names
CREATE OR REPLACE FUNCTION public.create_default_skills_for_user(user_profile_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Risk Management skills
  INSERT INTO public.user_skills (user_id, skill_key) VALUES
    (user_profile_id, 'position_sizing'),
    (user_profile_id, 'stop_loss_mastery'),
    (user_profile_id, 'risk_reward_optimization');
  
  -- Technical Analysis skills
  INSERT INTO public.user_skills (user_id, skill_key) VALUES
    (user_profile_id, 'chart_pattern_recognition'),
    (user_profile_id, 'indicator_mastery'),
    (user_profile_id, 'support_resistance');
  
  -- Psychology skills
  INSERT INTO public.user_skills (user_id, skill_key) VALUES
    (user_profile_id, 'emotional_control'),
    (user_profile_id, 'discipline_mastery'),
    (user_profile_id, 'fomo_resistance');
END;
$$;

-- Also update the handle_new_user function to ensure it has correct default values
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
