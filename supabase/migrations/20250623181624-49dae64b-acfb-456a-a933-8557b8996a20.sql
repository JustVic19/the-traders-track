
-- Function to grant XP to a specific skill
CREATE OR REPLACE FUNCTION public.grant_skill_xp(
  user_profile_id UUID,
  skill_name_param TEXT,
  xp_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_skill_level INTEGER;
  current_skill_xp INTEGER;
  max_xp_for_level INTEGER;
  new_xp INTEGER;
BEGIN
  -- Get current skill data
  SELECT skill_level, current_xp 
  INTO current_skill_level, current_skill_xp
  FROM user_skills 
  WHERE user_id = user_profile_id AND skill_name = skill_name_param;
  
  -- If skill doesn't exist, exit
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate max XP for current level (level * 100)
  max_xp_for_level := current_skill_level * 100;
  
  -- Calculate new XP (cap at max for current level)
  new_xp := LEAST(current_skill_xp + xp_amount, max_xp_for_level);
  
  -- Update the skill's XP
  UPDATE user_skills 
  SET current_xp = new_xp, updated_at = now()
  WHERE user_id = user_profile_id AND skill_name = skill_name_param;
END;
$$;

-- Function to upgrade a skill (secure backend logic)
CREATE OR REPLACE FUNCTION public.upgrade_skill(
  user_profile_id UUID,
  skill_name_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_skill_points INTEGER;
  current_skill_level INTEGER;
  current_skill_xp INTEGER;
  max_xp_for_level INTEGER;
  result JSON;
BEGIN
  -- Get user's available skill points
  SELECT skill_points INTO user_skill_points
  FROM profiles 
  WHERE id = user_profile_id;
  
  -- Check if user has at least 1 skill point
  IF user_skill_points < 1 THEN
    result := json_build_object(
      'success', false,
      'error', 'Insufficient skill points'
    );
    RETURN result;
  END IF;
  
  -- Get current skill data
  SELECT skill_level, current_xp 
  INTO current_skill_level, current_skill_xp
  FROM user_skills 
  WHERE user_id = user_profile_id AND skill_name = skill_name_param;
  
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
  
  -- Calculate max XP for current level
  max_xp_for_level := current_skill_level * 100;
  
  -- Check if current XP is at maximum for current level
  IF current_skill_xp < max_xp_for_level THEN
    result := json_build_object(
      'success', false,
      'error', 'Skill XP not at maximum for current level'
    );
    RETURN result;
  END IF;
  
  -- All conditions met, perform the upgrade
  -- 1. Subtract 1 skill point from user
  UPDATE profiles 
  SET skill_points = skill_points - 1
  WHERE id = user_profile_id;
  
  -- 2. Increase skill level by 1 and reset XP to 0
  UPDATE user_skills 
  SET skill_level = skill_level + 1, 
      current_xp = 0, 
      updated_at = now()
  WHERE user_id = user_profile_id AND skill_name = skill_name_param;
  
  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'Skill upgraded successfully'
  );
  RETURN result;
END;
$$;

-- Function to analyze trade and grant appropriate XP
CREATE OR REPLACE FUNCTION public.analyze_trade_and_grant_xp(
  user_profile_id UUID,
  trade_notes TEXT,
  trade_profit_loss NUMERIC,
  trade_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Grant XP based on trade notes/strategy tags
  IF trade_notes IS NOT NULL THEN
    -- Chart Pattern Recognition skills
    IF trade_notes ILIKE '%head and shoulders%' OR 
       trade_notes ILIKE '%double top%' OR 
       trade_notes ILIKE '%double bottom%' OR
       trade_notes ILIKE '%triangle%' OR
       trade_notes ILIKE '%flag%' OR
       trade_notes ILIKE '%pennant%' THEN
      PERFORM grant_skill_xp(user_profile_id, 'Chart Pattern Recognition', 10);
    END IF;
    
    -- Technical Indicators
    IF trade_notes ILIKE '%rsi%' OR 
       trade_notes ILIKE '%macd%' OR 
       trade_notes ILIKE '%moving average%' OR
       trade_notes ILIKE '%bollinger%' OR
       trade_notes ILIKE '%stochastic%' THEN
      PERFORM grant_skill_xp(user_profile_id, 'Indicator Mastery', 10);
    END IF;
    
    -- Support & Resistance
    IF trade_notes ILIKE '%support%' OR 
       trade_notes ILIKE '%resistance%' OR 
       trade_notes ILIKE '%breakout%' OR
       trade_notes ILIKE '%breakdown%' THEN
      PERFORM grant_skill_xp(user_profile_id, 'Support & Resistance', 10);
    END IF;
    
    -- Risk Management skills
    IF trade_notes ILIKE '%stop loss%' OR 
       trade_notes ILIKE '%sl%' THEN
      PERFORM grant_skill_xp(user_profile_id, 'Stop Loss Mastery', 15);
    END IF;
    
    IF trade_notes ILIKE '%position size%' OR 
       trade_notes ILIKE '%risk%' THEN
      PERFORM grant_skill_xp(user_profile_id, 'Position Sizing', 15);
    END IF;
    
    IF trade_notes ILIKE '%risk reward%' OR 
       trade_notes ILIKE '%r:r%' OR
       trade_notes ILIKE '%rr%' THEN
      PERFORM grant_skill_xp(user_profile_id, 'Risk/Reward Optimization', 15);
    END IF;
  END IF;
  
  -- Grant Psychology XP based on trade outcome and behavior
  IF trade_profit_loss IS NOT NULL THEN
    -- Emotional Control - grant XP for any completed trade (win or loss)
    PERFORM grant_skill_xp(user_profile_id, 'Emotional Control', 5);
    
    -- Discipline Mastery - grant more XP for profitable trades
    IF trade_profit_loss > 0 THEN
      PERFORM grant_skill_xp(user_profile_id, 'Discipline Mastery', 10);
    ELSE
      PERFORM grant_skill_xp(user_profile_id, 'Discipline Mastery', 5);
    END IF;
  END IF;
  
  -- FOMO Resistance - grant XP for any trade (logging shows discipline)
  PERFORM grant_skill_xp(user_profile_id, 'FOMO Resistance', 5);
END;
$$;
