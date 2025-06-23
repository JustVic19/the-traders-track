
-- Update the grant_skill_xp function to grant focus points instead
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
  -- Add focus points to the user's profile
  UPDATE profiles 
  SET focus_points = focus_points + points_amount, updated_at = now()
  WHERE id = user_profile_id;
END;
$$;

-- Update the analyze_trade_and_grant_xp function to use focus points
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
