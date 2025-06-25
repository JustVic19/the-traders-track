
-- Add columns to profiles table to store weekly insights
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS weekly_insights TEXT,
ADD COLUMN IF NOT EXISTS weekly_insights_date DATE;

-- Enable pg_cron extension for scheduling (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a database function to generate weekly insights for a specific user
CREATE OR REPLACE FUNCTION public.generate_weekly_insights_for_user(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  weekly_data JSON;
  trade_count INTEGER;
  weekly_pnl DECIMAL;
  weekly_win_rate DECIMAL;
  most_frequent_tag TEXT;
  result JSON;
BEGIN
  -- Get trades from the past 7 days
  SELECT 
    COUNT(*) as total_trades,
    COALESCE(SUM(profit_loss), 0) as total_pnl,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE profit_loss > 0)::DECIMAL / COUNT(*)) * 100, 1)
      ELSE 0 
    END as win_rate
  INTO trade_count, weekly_pnl, weekly_win_rate
  FROM trades 
  WHERE user_id = target_user_id 
    AND exit_date >= CURRENT_DATE - INTERVAL '7 days'
    AND NOT is_open;

  -- Get most frequent strategy tag from notes
  SELECT 
    COALESCE(
      (SELECT unnest(string_to_array(lower(notes), ' ')) as word
       FROM trades 
       WHERE user_id = target_user_id 
         AND exit_date >= CURRENT_DATE - INTERVAL '7 days'
         AND NOT is_open
         AND notes IS NOT NULL
       GROUP BY word 
       HAVING word IN ('scalp', 'swing', 'breakout', 'reversal', 'momentum', 'support', 'resistance')
       ORDER BY COUNT(*) DESC 
       LIMIT 1),
      'general trading'
    )
  INTO most_frequent_tag;

  -- Build the result JSON
  result := json_build_object(
    'user_id', target_user_id,
    'trade_count', trade_count,
    'weekly_pnl', weekly_pnl,
    'weekly_win_rate', weekly_win_rate,
    'most_frequent_tag', most_frequent_tag,
    'has_data', trade_count > 0
  );

  RETURN result;
END;
$$;

-- Create a function to generate weekly insights for all users
CREATE OR REPLACE FUNCTION public.generate_weekly_insights_for_all_users()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all users and trigger insight generation
  FOR user_record IN (SELECT id FROM profiles) LOOP
    -- This will be called by the edge function for each user
    -- The edge function will handle the Gemini API call and update
    RAISE NOTICE 'Processing weekly insights for user: %', user_record.id;
  END LOOP;
END;
$$;

-- Schedule the weekly insights generation for Sunday at 8 PM
SELECT cron.schedule(
  'generate-weekly-insights',
  '0 20 * * 0', -- Every Sunday at 8 PM
  $$
  SELECT
    net.http_post(
        url:='https://nlljmqzjnrrdqqkwfyvg.supabase.co/functions/v1/generate-weekly-insights',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sbGptcXpqbnJyZHFxa3dmeXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjg2NTMsImV4cCI6MjA2NTk0NDY1M30.PgabutFfZTII4RPESbanwyNdFZubniqp25duBwHNWvs"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);
