
-- Drop existing functions first to allow parameter name changes
DROP FUNCTION IF EXISTS public.grant_skill_xp(uuid, text, integer);
DROP FUNCTION IF EXISTS public.upgrade_skill(uuid, text);
DROP FUNCTION IF EXISTS public.invest_focus_points(text, integer);
DROP FUNCTION IF EXISTS public.analyze_trade_and_grant_xp(uuid, text, numeric, text);

-- Recreate grant_skill_xp function with correct parameter names and validation
CREATE OR REPLACE FUNCTION public.grant_skill_xp(
  user_profile_id UUID,
  skill_key_param TEXT,
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
  -- Validate inputs
  IF user_profile_id IS NULL OR skill_key_param IS NULL OR xp_amount IS NULL THEN
    RAISE EXCEPTION 'Invalid input parameters';
  END IF;
  
  IF xp_amount < 0 OR xp_amount > 1000 THEN
    RAISE EXCEPTION 'XP amount must be between 0 and 1000';
  END IF;
  
  -- Get current skill data using skill_key instead of skill_name
  SELECT skill_level, current_xp 
  INTO current_skill_level, current_skill_xp
  FROM user_skills 
  WHERE user_id = user_profile_id AND skill_key = skill_key_param;
  
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
  WHERE user_id = user_profile_id AND skill_key = skill_key_param;
END;
$$;

-- Recreate upgrade_skill function with skill_key and proper validation
CREATE OR REPLACE FUNCTION public.upgrade_skill(
  user_profile_id UUID,
  skill_key_param TEXT
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
  -- Validate inputs
  IF user_profile_id IS NULL OR skill_key_param IS NULL THEN
    result := json_build_object(
      'success', false,
      'error', 'Invalid input parameters'
    );
    RETURN result;
  END IF;
  
  -- Verify user exists and get their skill points
  SELECT skill_points INTO user_skill_points
  FROM profiles 
  WHERE id = user_profile_id;
  
  IF NOT FOUND THEN
    result := json_build_object(
      'success', false,
      'error', 'User not found'
    );
    RETURN result;
  END IF;
  
  -- Check if user has at least 1 skill point
  IF user_skill_points < 1 THEN
    result := json_build_object(
      'success', false,
      'error', 'Insufficient skill points'
    );
    RETURN result;
  END IF;
  
  -- Get current skill data using skill_key
  SELECT skill_level, current_xp 
  INTO current_skill_level, current_skill_xp
  FROM user_skills 
  WHERE user_id = user_profile_id AND skill_key = skill_key_param;
  
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
  WHERE user_id = user_profile_id AND skill_key = skill_key_param;
  
  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'Skill upgraded successfully'
  );
  RETURN result;
END;
$$;

-- Recreate invest_focus_points function with skill_key and validation
CREATE OR REPLACE FUNCTION public.invest_focus_points(
  skill_key_param TEXT,
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
  -- Validate inputs
  IF skill_key_param IS NULL OR points_amount IS NULL THEN
    result := json_build_object(
      'success', false,
      'error', 'Invalid input parameters'
    );
    RETURN result;
  END IF;
  
  IF points_amount < 1 OR points_amount > 1000 THEN
    result := json_build_object(
      'success', false,
      'error', 'Invalid points amount (must be 1-1000)'
    );
    RETURN result;
  END IF;
  
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    result := json_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
    RETURN result;
  END IF;
  
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
  
  -- Get current skill data using skill_key
  SELECT skill_level, current_xp 
  INTO current_skill_level, current_skill_xp
  FROM user_skills 
  WHERE user_id = auth.uid() AND skill_key = skill_key_param;
  
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
  
  -- 2. Add XP to the skill using skill_key
  UPDATE user_skills 
  SET current_xp = new_xp, updated_at = now()
  WHERE user_id = auth.uid() AND skill_key = skill_key_param;
  
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

-- Create helper function to grant focus points
CREATE OR REPLACE FUNCTION public.grant_focus_points(
  user_profile_id UUID,
  points_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate inputs
  IF user_profile_id IS NULL OR points_amount IS NULL OR points_amount < 0 THEN
    RAISE EXCEPTION 'Invalid input parameters';
  END IF;
  
  -- Add focus points to the user's profile
  UPDATE profiles 
  SET focus_points = focus_points + points_amount, updated_at = now()
  WHERE id = user_profile_id;
END;
$$;

-- Recreate analyze_trade_and_grant_xp function with proper focus points logic
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
DECLARE
  total_focus_points INTEGER := 0;
BEGIN
  -- Validate inputs
  IF user_profile_id IS NULL THEN
    RAISE EXCEPTION 'Invalid user profile ID';
  END IF;
  
  -- Calculate focus points based on trade notes/strategy tags
  IF trade_notes IS NOT NULL THEN
    -- Chart Pattern Recognition skills
    IF trade_notes ILIKE '%head and shoulders%' OR 
       trade_notes ILIKE '%double top%' OR 
       trade_notes ILIKE '%double bottom%' OR
       trade_notes ILIKE '%triangle%' OR
       trade_notes ILIKE '%flag%' OR
       trade_notes ILIKE '%pennant%' THEN
      total_focus_points := total_focus_points + 10;
    END IF;
    
    -- Technical Indicators
    IF trade_notes ILIKE '%rsi%' OR 
       trade_notes ILIKE '%macd%' OR 
       trade_notes ILIKE '%moving average%' OR
       trade_notes ILIKE '%bollinger%' OR
       trade_notes ILIKE '%stochastic%' THEN
      total_focus_points := total_focus_points + 10;
    END IF;
    
    -- Support & Resistance
    IF trade_notes ILIKE '%support%' OR 
       trade_notes ILIKE '%resistance%' OR 
       trade_notes ILIKE '%breakout%' OR
       trade_notes ILIKE '%breakdown%' THEN
      total_focus_points := total_focus_points + 10;
    END IF;
    
    -- Risk Management skills
    IF trade_notes ILIKE '%stop loss%' OR 
       trade_notes ILIKE '%sl%' THEN
      total_focus_points := total_focus_points + 15;
    END IF;
    
    IF trade_notes ILIKE '%position size%' OR 
       trade_notes ILIKE '%risk%' THEN
      total_focus_points := total_focus_points + 15;
    END IF;
    
    IF trade_notes ILIKE '%risk reward%' OR 
       trade_notes ILIKE '%r:r%' OR
       trade_notes ILIKE '%rr%' THEN
      total_focus_points := total_focus_points + 15;
    END IF;
  END IF;
  
  -- Grant Psychology focus points based on trade outcome and behavior
  IF trade_profit_loss IS NOT NULL THEN
    -- Emotional Control - grant points for any completed trade (win or loss)
    total_focus_points := total_focus_points + 5;
    
    -- Discipline Mastery - grant more points for profitable trades
    IF trade_profit_loss > 0 THEN
      total_focus_points := total_focus_points + 10;
    ELSE
      total_focus_points := total_focus_points + 5;
    END IF;
  END IF;
  
  -- FOMO Resistance - grant points for any trade (logging shows discipline)
  total_focus_points := total_focus_points + 5;
  
  -- Grant all accumulated focus points at once
  IF total_focus_points > 0 THEN
    PERFORM grant_focus_points(user_profile_id, total_focus_points);
  END IF;
END;
$$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view achievements of their guilds" ON public.guild_achievements;
DROP POLICY IF EXISTS "Only system can insert guild achievements" ON public.guild_achievements;
DROP POLICY IF EXISTS "Users can view tournament results" ON public.guild_tournament_results;
DROP POLICY IF EXISTS "Only system can manage tournament results" ON public.guild_tournament_results;
DROP POLICY IF EXISTS "Only system can update tournament results" ON public.guild_tournament_results;
DROP POLICY IF EXISTS "Users can view tournaments" ON public.guild_tournaments;
DROP POLICY IF EXISTS "Only system can manage tournaments" ON public.guild_tournaments;
DROP POLICY IF EXISTS "Anyone can view missions" ON public.missions;
DROP POLICY IF EXISTS "Only system can manage missions" ON public.missions;
DROP POLICY IF EXISTS "Anyone can view store items" ON public.store_items;
DROP POLICY IF EXISTS "Only system can manage store items" ON public.store_items;

-- Add missing RLS policies for guild_achievements
CREATE POLICY "Users can view achievements of their guilds" ON public.guild_achievements
  FOR SELECT USING (
    guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Only system can insert guild achievements" ON public.guild_achievements
  FOR INSERT WITH CHECK (false);

-- Add missing RLS policies for guild_tournament_results
CREATE POLICY "Users can view tournament results" ON public.guild_tournament_results
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only system can manage tournament results" ON public.guild_tournament_results
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Only system can update tournament results" ON public.guild_tournament_results
  FOR UPDATE USING (false);

-- Add missing RLS policies for guild_tournaments
CREATE POLICY "Users can view tournaments" ON public.guild_tournaments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only system can manage tournaments" ON public.guild_tournaments
  FOR INSERT WITH CHECK (false);

-- Add missing RLS policies for missions
CREATE POLICY "Anyone can view missions" ON public.missions
  FOR SELECT USING (true);

CREATE POLICY "Only system can manage missions" ON public.missions
  FOR INSERT WITH CHECK (false);

-- Add missing RLS policies for store_items  
CREATE POLICY "Anyone can view store items" ON public.store_items
  FOR SELECT USING (true);

CREATE POLICY "Only system can manage store items" ON public.store_items
  FOR INSERT WITH CHECK (false);

-- Create function to validate and process trades server-side
CREATE OR REPLACE FUNCTION public.validate_and_process_trade(
  trade_data JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id_param UUID;
  symbol_param TEXT;
  trade_type_param TEXT;
  quantity_param NUMERIC;
  entry_price_param NUMERIC;
  exit_price_param NUMERIC;
  entry_date_param TIMESTAMP WITH TIME ZONE;
  exit_date_param TIMESTAMP WITH TIME ZONE;
  notes_param TEXT;
  calculated_pnl NUMERIC;
  result JSON;
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL THEN
    result := json_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
    RETURN result;
  END IF;
  
  -- Extract and validate trade data
  user_id_param := auth.uid();
  symbol_param := trade_data->>'symbol';
  trade_type_param := trade_data->>'trade_type';
  quantity_param := (trade_data->>'quantity')::NUMERIC;
  entry_price_param := (trade_data->>'entry_price')::NUMERIC;
  exit_price_param := (trade_data->>'exit_price')::NUMERIC;
  entry_date_param := (trade_data->>'entry_date')::TIMESTAMP WITH TIME ZONE;
  exit_date_param := (trade_data->>'exit_date')::TIMESTAMP WITH TIME ZONE;
  notes_param := trade_data->>'notes';
  
  -- Validate required fields
  IF symbol_param IS NULL OR trade_type_param IS NULL OR 
     quantity_param IS NULL OR entry_price_param IS NULL THEN
    result := json_build_object(
      'success', false,
      'error', 'Missing required trade data'
    );
    RETURN result;
  END IF;
  
  -- Validate numeric fields
  IF quantity_param <= 0 OR entry_price_param <= 0 THEN
    result := json_build_object(
      'success', false,
      'error', 'Invalid quantity or entry price'
    );
    RETURN result;
  END IF;
  
  IF exit_price_param IS NOT NULL AND exit_price_param <= 0 THEN
    result := json_build_object(
      'success', false,
      'error', 'Invalid exit price'
    );
    RETURN result;
  END IF;
  
  -- Validate trade type
  IF trade_type_param NOT IN ('buy', 'sell') THEN
    result := json_build_object(
      'success', false,
      'error', 'Invalid trade type'
    );
    RETURN result;
  END IF;
  
  -- Calculate P&L if exit price is provided
  IF exit_price_param IS NOT NULL THEN
    IF trade_type_param = 'buy' THEN
      calculated_pnl := (exit_price_param - entry_price_param) * quantity_param;
    ELSE
      calculated_pnl := (entry_price_param - exit_price_param) * quantity_param;
    END IF;
  END IF;
  
  -- Sanitize notes (limit length and remove potentially harmful content)
  IF notes_param IS NOT NULL THEN
    notes_param := LEFT(notes_param, 1000);
    -- Remove potential script tags and other harmful content
    notes_param := regexp_replace(notes_param, '<[^>]*>', '', 'g');
  END IF;
  
  result := json_build_object(
    'success', true,
    'validated_trade', json_build_object(
      'user_id', user_id_param,
      'symbol', symbol_param,
      'trade_type', trade_type_param,
      'quantity', quantity_param,
      'entry_price', entry_price_param,
      'exit_price', exit_price_param,
      'entry_date', entry_date_param,
      'exit_date', exit_date_param,
      'notes', notes_param,
      'profit_loss', calculated_pnl
    )
  );
  
  RETURN result;
END;
$$;
