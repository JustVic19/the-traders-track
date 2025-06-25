
-- Fix the analyze_user_mistake_patterns function to handle GROUP BY properly
CREATE OR REPLACE FUNCTION public.analyze_user_mistake_patterns(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trade_data JSON;
  result JSON;
  total_trades INTEGER;
  friday_losses DECIMAL := 0;
  monday_losses DECIMAL := 0;
  weekend_losses DECIMAL := 0;
  largest_loss_day TEXT;
  largest_loss_amount DECIMAL := 0;
  revenge_trades INTEGER := 0;
  revenge_losses DECIMAL := 0;
  quick_trades INTEGER := 0;
  quick_losses DECIMAL := 0;
  pattern_type TEXT;
  pattern_description TEXT;
BEGIN
  -- Get user's last 50-100 trades
  SELECT 
    COUNT(*) as total_count,
    json_agg(
      json_build_object(
        'symbol', symbol,
        'profit_loss', profit_loss,
        'exit_date', exit_date,
        'entry_date', entry_date,
        'notes', notes,
        'day_of_week', EXTRACT(DOW FROM exit_date),
        'time_held_minutes', EXTRACT(EPOCH FROM (exit_date - entry_date))/60
      )
    ) as trades_json
  INTO total_trades, trade_data
  FROM trades 
  WHERE user_id = target_user_id 
    AND NOT is_open 
    AND profit_loss IS NOT NULL
    AND exit_date IS NOT NULL
    AND exit_date >= CURRENT_DATE - INTERVAL '90 days'
  ORDER BY exit_date DESC 
  LIMIT 100;

  -- Skip analysis if insufficient data
  IF total_trades < 10 THEN
    result := json_build_object(
      'has_data', false,
      'reason', 'insufficient_trades'
    );
    RETURN result;
  END IF;

  -- Analyze day-of-week patterns
  SELECT 
    COALESCE(SUM(CASE WHEN (trade->>'day_of_week')::INTEGER = 5 AND (trade->>'profit_loss')::DECIMAL < 0 
                      THEN ABS((trade->>'profit_loss')::DECIMAL) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN (trade->>'day_of_week')::INTEGER = 1 AND (trade->>'profit_loss')::DECIMAL < 0 
                      THEN ABS((trade->>'profit_loss')::DECIMAL) ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN (trade->>'day_of_week')::INTEGER IN (0,6) AND (trade->>'profit_loss')::DECIMAL < 0 
                      THEN ABS((trade->>'profit_loss')::DECIMAL) ELSE 0 END), 0)
  INTO friday_losses, monday_losses, weekend_losses
  FROM json_array_elements(trade_data) as trade;

  -- Find the day with highest losses
  IF friday_losses >= monday_losses AND friday_losses >= weekend_losses AND friday_losses > 0 THEN
    largest_loss_day := 'Friday';
    largest_loss_amount := friday_losses;
  ELSIF monday_losses >= weekend_losses AND monday_losses > 0 THEN
    largest_loss_day := 'Monday';
    largest_loss_amount := monday_losses;
  ELSIF weekend_losses > 0 THEN
    largest_loss_day := 'Weekend';
    largest_loss_amount := weekend_losses;
  END IF;

  -- Analyze revenge trading patterns (trades with "revenge" or quick succession)
  SELECT 
    COUNT(*),
    COALESCE(SUM(CASE WHEN (trade->>'profit_loss')::DECIMAL < 0 
                      THEN ABS((trade->>'profit_loss')::DECIMAL) ELSE 0 END), 0)
  INTO revenge_trades, revenge_losses
  FROM json_array_elements(trade_data) as trade
  WHERE LOWER(trade->>'notes') LIKE '%revenge%' 
     OR LOWER(trade->>'notes') LIKE '%frustrat%'
     OR LOWER(trade->>'notes') LIKE '%angry%';

  -- Analyze quick trades (held less than 30 minutes)
  SELECT 
    COUNT(*),
    COALESCE(SUM(CASE WHEN (trade->>'profit_loss')::DECIMAL < 0 
                      THEN ABS((trade->>'profit_loss')::DECIMAL) ELSE 0 END), 0)
  INTO quick_trades, quick_losses
  FROM json_array_elements(trade_data) as trade
  WHERE (trade->>'time_held_minutes')::DECIMAL < 30
    AND (trade->>'profit_loss')::DECIMAL < 0;

  -- Determine the most costly pattern
  IF largest_loss_amount >= revenge_losses AND largest_loss_amount >= quick_losses AND largest_loss_amount > 0 THEN
    pattern_type := 'day_pattern';
    pattern_description := format('Most losses occur on %s ($%.2f in recent trades)', largest_loss_day, largest_loss_amount);
  ELSIF revenge_losses >= quick_losses AND revenge_losses > 0 AND revenge_trades >= 3 THEN
    pattern_type := 'revenge_trading';
    pattern_description := format('Revenge trading pattern detected (%s trades, $%.2f in losses)', revenge_trades, revenge_losses);
  ELSIF quick_losses > 0 AND quick_trades >= 5 THEN
    pattern_type := 'quick_trades';
    pattern_description := format('Quick exit pattern (%s trades under 30min, $%.2f in losses)', quick_trades, quick_losses);
  ELSE
    pattern_type := 'general';
    pattern_description := 'Focus on maintaining consistent trading discipline';
  END IF;

  result := json_build_object(
    'user_id', target_user_id,
    'total_trades', total_trades,
    'has_data', true,
    'pattern_type', pattern_type,
    'pattern_description', pattern_description,
    'friday_losses', friday_losses,
    'monday_losses', monday_losses,
    'weekend_losses', weekend_losses,
    'revenge_trades', revenge_trades,
    'revenge_losses', revenge_losses,
    'quick_trades', quick_trades,
    'quick_losses', quick_losses
  );

  RETURN result;
END;
$$;
